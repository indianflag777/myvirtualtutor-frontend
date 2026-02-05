"use client";

import { useMemo, useRef, useState } from "react";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "1";
const SERVER_BASE = process.env.NEXT_PUBLIC_SERVER_BASE || "http://127.0.0.1:3001";

function buildTutorInstructions({ grade, topic }) {
  return `
You are MyVirtualTutor, a live math tutor for students in grades 3–8.

Mode: TEACHING ONLY.
- Do not give answers immediately.
- Teach step-by-step using hints.
- Ask short check-in questions frequently.
- If the student asks for the answer, guide them to derive it.

Language:
- Respond ONLY in English.
- Never respond in Spanish or any other non-English language.
- If the student uses another language, still respond in English and briefly ask them to continue in English.
- Do NOT translate your own responses into other languages.

Student:
- Grade: ${grade}
- Topic: ${topic}

Style:
- Keep responses short, clear, and encouraging.
- Use simple examples.
- No personal data requests.
`.trim();
}

function safeGet(obj, path) {
  let cur = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

export default function Page() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("Fractions");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

  const tutorInstructions = useMemo(
    () => buildTutorInstructions({ grade, topic }),
    [grade, topic]
  );

  function logSystem(text) {
    setMessages((m) => [...m, { role: "system", text }]);
  }
  function addUser(text) {
    setMessages((m) => [...m, { role: "user", text }]);
  }
  function addAssistant(text) {
    setMessages((m) => [...m, { role: "assistant", text }]);
  }

  function sendEvent(evt) {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;
    try {
      dc.send(JSON.stringify(evt));
    } catch (e) {
      console.error("sendEvent failed:", e);
    }
  }

  function handleServerEvent(ev) {
    let evt;
    try {
      evt = JSON.parse(ev.data);
    } catch {
      return;
    }

    if (DEBUG) console.log("OAI EVENT:", evt);

    if (evt.type === "error") {
      const msg = safeGet(evt, ["error", "message"]) || JSON.stringify(evt);
      addAssistant(`(Error) ${msg}`);
      return;
    }

    // Streamed text
    const deltaCandidates = [
      evt?.delta,
      safeGet(evt, ["text", "delta"]),
      safeGet(evt, ["response", "delta"]),
      safeGet(evt, ["response", "output_text", "delta"]),
      safeGet(evt, ["response", "output", 0, "content", 0, "delta"]),
    ];
    const delta = deltaCandidates.find((d) => typeof d === "string" && d.length);

    if (evt?.type === "response.output_text.delta" && typeof delta === "string") {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, text: (last.text || "") + delta };
        } else {
          copy.push({ role: "assistant", text: delta });
        }
        return copy;
      });
      return;
    }

    // IMPORTANT: do NOT append response.done (prevents duplicates / mixed payloads)
    if (evt?.type === "response.done") return;
  }

  async function connect() {
    if (connecting || connected) return;

    setConnecting(true);
    logSystem("Connecting voice + chat session...");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0];
      };

      // mic -> peer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) pc.addTrack(track, stream);

      // data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onmessage = (ev) => {
        if (DEBUG) console.log("OAI RAW:", ev.data);
        try {
          handleServerEvent(ev);
        } catch (err) {
          console.log("handleServerEvent error:", err);
        }
      };

      dc.onopen = () => {
        // FIX: include required session.type (and model) for session.update
        sendEvent({
          type: "session.update",
          session: {
            type: "realtime",
            model: "gpt-realtime",
            instructions: tutorInstructions,
          },
        });

        logSystem("Data channel open. English-only instructions applied.");

        // Kick off first tutor text
        sendEvent({
          type: "response.create",
          response: {
            output_modalities: ["text"],
            instructions: tutorInstructions,
          },
        });

        setConnected(true);
        setConnecting(false);
      };

      pc.addTransceiver("audio", { direction: "recvonly" });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Exchange SDP with your backend (server-side OpenAI call)
      const ansRes = await fetch(`${SERVER_BASE}/webrtc/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      console.log("[MVT] /webrtc/answer status:", ansRes.status);
      if (!ansRes.ok) throw new Error(await ansRes.text());

      const answerSdp = await ansRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      logSystem("Session ready. Speak or type to start.");
    } catch (err) {
      logSystem(`Connection failed: ${String(err?.message || err)}`);
      disconnect();
      setConnecting(false);
      setConnected(false);
    }
  }

  function disconnect() {
    try {
      dcRef.current?.close();
    } catch {}
    try {
      pcRef.current?.close();
    } catch {}
    dcRef.current = null;
    pcRef.current = null;
    setConnected(false);
    setConnecting(false);
    logSystem("Disconnected.");
  }

  function sendText() {
    const text = input.trim();
    if (!text) return;

    setInput("");
    addUser(text);

    sendEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });

    sendEvent({
      type: "response.create",
      response: {
        output_modalities: ["text"],
        instructions: tutorInstructions,
      },
    });
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0b1220", color: "#e8eefc" }}>
      <div style={{ width: 360, padding: 16, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 style={{ margin: "0 0 12px 0" }}>MyVirtualTutor Live</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Voice + chat AI math tutor (Grades 3–8). Teaching-only mode.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Grade</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={connected || connecting}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#111b30",
                color: "#e8eefc",
              }}
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={connected || connecting}
              placeholder="Fractions, Decimals, Pre-algebra..."
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#111b30",
                color: "#e8eefc",
              }}
            />
          </label>

          {!connected ? (
            <button
              onClick={connect}
              disabled={connecting}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: connecting ? "#1a2642" : "#1f7a4a",
                color: "#fff",
                cursor: connecting ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {connecting ? "Connecting..." : "Start Voice + Chat Session"}
            </button>
          ) : (
            <button
              onClick={disconnect}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "#8b2a2a",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              End Session
            </button>
          )}

          <audio ref={audioRef} autoPlay style={{ width: "100%" }} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: 16, overflow: "auto" }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 12, display: "flex" }}>
              <div
                style={{
                  maxWidth: 900,
                  padding: 12,
                  borderRadius: 14,
                  background:
                    m.role === "user"
                      ? "rgba(31,122,74,0.25)"
                      : m.role === "assistant"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  {m.role === "user" ? "You" : m.role === "assistant" ? "Tutor" : "System"}
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!connected}
            placeholder={connected ? "Type a question (or just speak)..." : "Connect first..."}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendText();
            }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#111b30",
              color: "#e8eefc",
            }}
          />
          <button
            onClick={sendText}
            disabled={!connected || !input.trim()}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: !connected || !input.trim() ? "#1a2642" : "#2b5bd7",
              color: "#fff",
              cursor: !connected || !input.trim() ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

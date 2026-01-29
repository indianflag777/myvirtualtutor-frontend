"use client";

import { useMemo, useRef, useState } from "react";

const SERVER_BASE =
  process.env.NEXT_PUBLIC_SERVER_BASE || "http://127.0.0.1:3001";

function buildTutorInstructions({ grade, topic }) {
  return `
You are MyVirtualTutor, a live math tutor for students in grades 3–8.

Mode: TEACHING ONLY.
- Do not give answers immediately.
- Teach step-by-step using hints.
- Ask short check-in questions frequently.

Student:
- Grade: ${grade}
- Topic: ${topic}

Style:
- Keep responses short, clear, and encouraging.
`.trim();
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
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
    dc.send(JSON.stringify(evt));
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

  async function connect() {
    console.log("[MVT] connect() clicked");
    if (connecting || connected) return;

    setConnecting(true);
    logSystem("Connecting voice + chat session...");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
// --- tutor start gate (DO NOT EDIT) ---
let dcOpen = false;
let remoteReady = false;
let started = false;

const maybeStartTutor = () => {
  if (started) return;
  if (!dcOpen || !remoteReady) return;
  started = true;

  logSystem("Tutor ready. Say hi!");

  sendEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        { type: "input_text", text: "Say hello and ask what math topic and grade we should work on." }
      ],
    },
  });

  sendEvent({
    type: "response.create",
    response: {
      output_modalities: ["audio"],
      instructions: tutorInstructions,
    },
  });
};
// --- end tutor start gate ---
pc.onconnectionstatechange = () => {
  console.log("[MVT] pc.connectionState:", pc.connectionState);

  if (pc.connectionState === "connected") {
    setConnected(true);
    setConnecting(false);
    logSystem("Connected. Waiting for tutor audio...");
  }
};
      pc.oniceconnectionstatechange = () => {
        console.log("[MVT] pc.iceConnectionState:", pc.iceConnectionState);
      };

      // Remote audio playback
      pc.ontrack = (e) => {
        const stream = e.streams?.[0];
        if (!stream) return;
        if (!audioRef.current) return;

        audioRef.current.srcObject = stream;
        audioRef.current.autoplay = true;
        audioRef.current.playsInline = true;
        audioRef.current.muted = false;

        audioRef.current.play?.().catch(() => {
          logSystem("Audio blocked by browser. Click the page once and try again.");
        });
      };

      // Mic input
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach((t) => pc.addTrack(t, micStream));

      // Receive tutor audio
      pc.addTransceiver("audio", { direction: "recvonly" });

      // Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        logSystem("Connected. Initializing tutor...");
        setConnected(true);
        setConnecting(false);

        dcOpen = true;
        maybeStartTutor();

        // Make tutor speak immediately
        sendEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Say hello and ask what math topic and grade we should work on.",
              },
            ],
          },
        });

        sendEvent({
          type: "response.create",
          response: {
            output_modalities: ["audio", "text"],
            instructions: tutorInstructions,
          },
        });
      });

      dc.addEventListener("message", (ev) => {
        const evt = safeJsonParse(ev.data);
        if (!evt) return;

        // Handle common text fields
        const delta =
          evt?.delta ||
          evt?.text?.delta ||
          evt?.response?.delta ||
          evt?.response?.output_text?.delta;

        if (typeof delta === "string" && delta.length) {
          // Stream deltas into last assistant msg
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

        // Final text (if present)
        const finalText =
          evt?.response?.output_text ||
          evt?.response?.output?.[0]?.content?.[0]?.text;

        if (typeof finalText === "string" && finalText.trim()) {
          addAssistant(finalText.trim());
        }

        if (evt?.type === "error") {
          addAssistant(`(Error) ${evt?.error?.message || "Unknown error"}`);
        }
      });

      // Offer/Answer via backend
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sessionRes = await fetch(`${SERVER_BASE}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      console.log("[MVT] /session status:", sessionRes.status);
      if (!sessionRes.ok) throw new Error(await sessionRes.text());

      const ansRes = await fetch(`${SERVER_BASE}/webrtc/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      console.log("[MVT] /webrtc/answer status:", ansRes.status);
      if (!ansRes.ok) throw new Error(await ansRes.text());

      const answerSdp = await ansRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      remoteReady = true;
      maybeStartTutor();

      logSystem("Session ready. Speak or type to start.");
    } catch (err) {
      logSystem(`Connection failed: ${String(err?.message || err)}`);
      disconnect();
      setConnecting(false);
      setConnected(false);
    }
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
        output_modalities: ["audio", "text"],
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
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {["3","4","5","6","7","8"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Topic</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </label>

          {!connected ? (
            <button onClick={connect} disabled={connecting}>
              {connecting ? "Initializing tutor..." : "Connect to Live Tutor"}
            </button>
          ) : (
            <button onClick={disconnect}>Disconnect</button>
          )}

          <div style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Message</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? sendText() : null)}
              placeholder="Type a math question..."
            />
            <button onClick={sendText} disabled={!connected}>
              Send
            </button>
          </div>
        </div>

        <audio ref={audioRef} autoPlay playsInline />
      </div>

      <div style={{ flex: 1, padding: 16, overflow: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, opacity: m.role === "system" ? 0.85 : 1 }}>
            <b style={{ textTransform: "capitalize" }}>{m.role}:</b> {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

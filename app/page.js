
"use client";



import { useEffect, useMemo, useRef, useState } from "react";
import Whiteboard from "./components/Whiteboard";
import whiteboardTest from "./whiteboard-test.json";
import whiteboardStep2 from "./whiteboard-test-step2.json";
import whiteboardStep3 from "./whiteboard-test-step3.json";



const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "1";

const SERVER_BASE = process.env.NEXT_PUBLIC_SERVER_BASE || "http://127.0.0.1:10000";



// 15-minute free trial (seconds)

const TRIAL_SECONDS = 15 * 60;



function buildTutorInstructions({ grade, topic }) {

  return `

You are MyVirtualTutor, a live math tutor for students in grades 3–8.



SCOPE (STRICT):

- ONLY help with MATH tutoring for grades 3–8.

- If the user asks anything non-math (personal life, relationships, work, money, coding, health, etc.), refuse briefly and redirect to a math question.

- Do NOT engage in general conversation. Do NOT give life advice. Do NOT discuss personal topics.



MODE: TEACHING ONLY (no direct answers).

- Do not give answers immediately.

- Teach step-by-step using hints.

- Ask short check-in questions frequently.

- If the student asks for the answer, guide them to derive it.



LANGUAGE (STRICT):

- Respond ONLY in English.

- Never respond in Spanish or any other non-English language.

- If the student uses another language, still respond in English and ask them to continue in English.



STUDENT CONTEXT:

- Grade: ${grade}

- Topic focus: ${topic}



STYLE:

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



function formatMMSS(totalSeconds) {

  const s = Math.max(0, Math.floor(totalSeconds));

  const mm = String(Math.floor(s / 60)).padStart(2, "0");

  const ss = String(s % 60).padStart(2, "0");

  return `${mm}:${ss}`;

}



export default function Page() {

  const [connected, setConnected] = useState(false);

  const [connecting, setConnecting] = useState(false);



  const [grade, setGrade] = useState("5");

  const [topic, setTopic] = useState("Fractions");



  const [messages, setMessages] = useState([]);
  const [wbStep, setWbStep] = useState(1);

  const [wbData, setWbData] = useState(whiteboardTest);

  function appendOps(newOps) {
    setWbData(prev => {
      const safePrev = prev && prev.board ? prev : whiteboardTest;
      return {
        ...safePrev,
        ops: [...(safePrev.ops || []), ...newOps]
      };
    });
  }

  useEffect(() => {
    if (wbStep === 1) setWbData(whiteboardTest);
    else if (wbStep === 2) setWbData(whiteboardStep2);
    else setWbData(whiteboardStep3);
  }, [wbStep]);

  const [input, setInput] = useState("");



  const [trialActive, setTrialActive] = useState(false);

  const [trialRemaining, setTrialRemaining] = useState(TRIAL_SECONDS);



  const pcRef = useRef(null);

  const dcRef = useRef(null);

  const bottomRef = useRef(null);

  const [autoScroll, setAutoScroll] = useState(true);



  // Auto-scroll chat while streaming, unless user has scrolled up

  useEffect(() => {

    if (autoScroll) {

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    }

  }, [messages, autoScroll]);

  const audioRef = useRef(null);

  const trialTimerRef = useRef(null);



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

    setMessages((m) => {

      const last = m[m.length - 1];

      if (last?.role === "assistant" && last?.text === text) return m;

      return [...m, { role: "assistant", text }];

    });

  }



  function sendEvent(evt) {

    const dc = dcRef.current;

    if (!dc || dc.readyState !== "open") return;

    dc.send(JSON.stringify(evt));

  }



  function handleServerEvent(e) {

    let evt;

    try {

      evt = JSON.parse(e.data);

    } catch {

      return;

    }



    if (DEBUG) console.log("OAI EVENT:", evt);



    if (evt.type === "error") {

      const msg = safeGet(evt, ["error", "message"]) || JSON.stringify(evt);

      addAssistant(`(Error) ${msg}`);

      return;

    }



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

        if (last && last.role === "assistant") {

          copy[copy.length - 1] = { ...last, text: (last.text || "") + delta };

        } else {

          copy.push({ role: "assistant", text: delta });

        }

        return copy;

      });

      return;

    }



    // We intentionally ignore response.done to avoid duplicate final payloads

    if (evt.type === "response.done") return;



    // Fallback: some servers send full output in other event types

    const out = safeGet(evt, ["response", "output"]) || [];

    let finalText = "";



    for (const item of out) {

      if (item?.type === "message" && Array.isArray(item?.content)) {

        for (const c of item.content) {

          if (c?.type === "output_text" && typeof c?.text === "string") {

            finalText += c.text;

          }

        }

      }

    }



    if (finalText.trim()) addAssistant(finalText.trim());

  }



  function startTrialTimer() {

    // reset

    clearInterval(trialTimerRef.current);

    setTrialActive(true);

    setTrialRemaining(TRIAL_SECONDS);



    trialTimerRef.current = setInterval(() => {

      setTrialRemaining((prev) => {

        const next = prev - 1;

        if (next <= 0) {

          clearInterval(trialTimerRef.current);

          trialTimerRef.current = null;

          return 0;

        }

        return next;

      });

    }, 1000);



    logSystem(`Free trial started: ${formatMMSS(TRIAL_SECONDS)} remaining.`);

  }



  function stopTrialTimer() {

    clearInterval(trialTimerRef.current);

    trialTimerRef.current = null;

    setTrialActive(false);

    setTrialRemaining(TRIAL_SECONDS);

  }



  useEffect(() => {

    if (trialActive && trialRemaining === 0) {

      logSystem("Free trial ended. Disconnecting session.");

      disconnect();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [trialRemaining, trialActive]);



  async function connect() {

    if (connecting || connected) return;

    if (trialActive && trialRemaining === 0) {

      logSystem("Trial already ended. Refresh the page to start again.");

      return;

    }



    setConnecting(true);

    logSystem("Connecting voice + chat session...");



    try {

      const pc = new RTCPeerConnection();

      pcRef.current = pc;



      pc.ontrack = (e) => {

        if (audioRef.current) audioRef.current.srcObject = e.streams[0];

      };



      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      for (const track of stream.getTracks()) pc.addTrack(track, stream);



      const dc = pc.createDataChannel("oai-events");

      dcRef.current = dc;



      dc.addEventListener("open", () => {

        // IMPORTANT: include session.type to avoid the session.type missing error

        sendEvent({

          type: "session.update",

          session: {

            type: "realtime",

            output_modalities: ["audio"],

            instructions: tutorInstructions,

          },

        });



        logSystem("Data channel open. Tutor locked to English + Math-only.");

        startTrialTimer();

        // Kickoff disabled: wait for user speech/text before creating a response.

        setConnected(true);

        setConnecting(false);

        logSystem("Session ready. Speak or type to start.");

      });



      dc.addEventListener("message", (ev) => {

        if (DEBUG) console.log("OAI RAW:", ev.data);

        try {

          handleServerEvent(ev);

        } catch (err) {

          console.log("handleServerEvent error:", err);

        }

      });



      pc.addTransceiver("audio", { direction: "recvonly" });

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);



      const ansRes = await fetch(`${SERVER_BASE}/webrtc/answer`, {

        method: "POST",

        headers: { "Content-Type": "application/sdp" },

        body: offer.sdp,

      });



      if (DEBUG) console.log("[MVT] /webrtc/answer status:", ansRes.status);

      if (!ansRes.ok) throw new Error(await ansRes.text());



      const answerSdp = await ansRes.text();

      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

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

    stopTrialTimer();

    logSystem("Disconnected.");

  }



  function sendText() {

    const text = input.trim();

    if (!text) return;

    if (!connected) return;



    // enforce trial limit client-side too

    if (trialActive && trialRemaining <= 0) {

      logSystem("Free trial ended. Please refresh to start again.");

      return;

    }



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

              style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#111b30", color: "#e8eefc" }}

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

              style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "#111b30", color: "#e8eefc" }}

            />

          </label>



          <div

            style={{

              padding: 12,

              borderRadius: 12,

              border: "1px solid rgba(255,255,255,0.08)",

              background: "rgba(255,255,255,0.03)",

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              gap: 10,

            }}

          >

            <div style={{ fontSize: 12, opacity: 0.9 }}>

              Free Trial

              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>

                {trialActive ? formatMMSS(trialRemaining) : formatMMSS(TRIAL_SECONDS)}

              </div>

            </div>

            <div style={{ fontSize: 12, opacity: 0.75, textAlign: "right" }}>

              {trialActive ? "running" : "starts on connect"}

            </div>

          </div>



          {!connected ? (

            <button

              onClick={connect}

              disabled={connecting}

              style={{

                padding: 12,

                borderRadius: 12,

                border: "1px solid rgba(255,255,255,0.18)",

                background: connecting ? "#1a2642" : "#2b5bd7",

                color: "#fff",

                cursor: connecting ? "not-allowed" : "pointer",

                fontWeight: 700,

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

                fontWeight: 700,

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

          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
  <button onClick={() => setWbStep(1)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #333",background:"#111",color:"#fff"}}>WB Step 1</button>
  <button onClick={() => setWbStep(2)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #333",background:"#111",color:"#fff"}}>WB Step 2</button>
  <button onClick={() => setWbStep(3)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #333",background:"#111",color:"#fff"}}>AI Test Draw</button>
  <button onClick={() => appendOps([
    { op:"add", kind:"text", props:{ x:160, y:260, text:"Appended dynamically 🚀", color:"#34d399", fontSize:28, fontWeight:700 } }
  ])} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #333",background:"#0a0",color:"#fff"}}>Append Ops</button>
</div>
<Whiteboard data={wbData} />

          <button
            onClick={() => setWbStep(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
            style={{ margin: '8px 0', padding: '6px 12px', fontWeight: 600 }}
          >
            Next Step
          </button>


          {messages.map((m, idx) => (

            <div key={idx} style={{ marginBottom: 12, display: "flex" }}>

              <div

                style={{

                  maxWidth: 900,

                  padding: 12,

                  borderRadius: 14,

                  background:

                    m.role === "user"

                      ? "rgba(43,91,215,0.18)"

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

          <div ref={bottomRef} />

        </div>



        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10 }}>

          <input

            value={input}

            onChange={(e) => setInput(e.target.value)}

            disabled={!connected}

            placeholder={connected ? "Type a math question (or just speak)..." : "Connect first..."}

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

              background: !connected || !input.trim() ? "#1a2642" : "#1f7a4a",

              color: "#fff",

              cursor: !connected || !input.trim() ? "not-allowed" : "pointer",

              fontWeight: 700,

            }}

          >

            Send

          </button>

        </div>

      </div>

    </div>

  );

}

"use client";

import React from "react";
import SessionShell from "../../components/session/SessionShell";
import WhiteboardPanel from "../../components/whiteboard/WhiteboardPanel";
import SessionControlBar from "../../components/session/SessionControlBar";
import TutorPanel from "../../components/session/TutorPanel";

export default function SessionPage() {
  const [messages, setMessages] = React.useState([]);
  const boardApiRef = React.useRef(null);

  const writeStepsPaced = async (lines, delayMs = 700) => {
    for (const line of lines) {
      boardApiRef.current?.writeLines?.([line]);
      // simple pacing delay
      await new Promise((r) => setTimeout(r, delayMs));
    }
  };

  const onSend = async (text) => {
    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Local "tutor" that follows C3 prompt behavior (placeholder)
    const tutorIntro = {
      id: crypto.randomUUID(),
      role: "tutor",
      content: "Want me to show this on the board? (local demo)",
    };
    setMessages((prev) => [...prev, tutorIntro]);

    // For demo: always write steps for anything that looks multi-step
    // (Backend + real reasoning comes later)
    const steps = [
      `Goal: ${text}`,
      "1) Identify what is given.",
      "2) Apply the rule/formula.",
      "3) Solve and check.",
      "Answer: (demo placeholder)",
    ];

    // Clear board and write paced
    boardApiRef.current?.clear?.();
    await writeStepsPaced(steps, 650);

    const tutorDone = {
      id: crypto.randomUUID(),
      role: "tutor",
      content: "I wrote the steps on the board. What would you do for Step 1?",
    };
    setMessages((prev) => [...prev, tutorDone]);
  };

  return (
    <SessionShell
      tutor={<TutorPanel messages={messages} onSend={onSend} />}
      whiteboard={<WhiteboardPanel apiRef={boardApiRef} />}
      controls={
        <SessionControlBar
          secondsRemaining={900}
          onEnd={() => alert("End session (placeholder)")}
        />
      }
    />
  );
}

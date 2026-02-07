"use client";

import React from "react";
import SessionShell from "../../components/session/SessionShell";
import WhiteboardPanel from "../../components/whiteboard/WhiteboardPanel";
import SessionControlBar from "../../components/session/SessionControlBar";
import TutorPanel from "../../components/session/TutorPanel";

export default function SessionPage() {
  const [messages, setMessages] = React.useState([]);

  const onSend = (text) => {
    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Temporary local tutor placeholder (backend wiring comes later)
    const tutorMsg = {
      id: crypto.randomUUID(),
      role: "tutor",
      content: "Got it. (Tutor backend not wired yet.) Want me to show the steps on the board?",
    };
    setTimeout(() => setMessages((prev) => [...prev, tutorMsg]), 250);
  };

  return (
    <SessionShell
      tutor={<TutorPanel messages={messages} onSend={onSend} />}
      whiteboard={<WhiteboardPanel />}
      controls={<SessionControlBar secondsRemaining={900} onEnd={() => alert("End session (placeholder)")} />}
    />
  );
}

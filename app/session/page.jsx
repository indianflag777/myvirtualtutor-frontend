"use client";

import React from "react";
import SessionShell from "../../components/session/SessionShell";
import WhiteboardPanel from "../../components/whiteboard/WhiteboardPanel";
import SessionControlBar from "../../components/session/SessionControlBar";
import TutorPanel from "../../components/session/TutorPanel";

export default function SessionPage() {
  const [messages, setMessages] = React.useState([]);
  const boardApiRef = React.useRef(null);

  // C5-B: countdown (15 minutes)
  const [secondsRemaining, setSecondsRemaining] = React.useState(900);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    // start timer once
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 0) return 0;
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (secondsRemaining !== 0) return;

    // auto-end behavior at 0
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "tutor",
        content: "Session time is up. If you’d like to continue, please start a new session.",
      },
    ]);

    // optional: note on board
    boardApiRef.current?.writeLines?.(["", "Session ended."]);
  }, [secondsRemaining]);

  const writeStepsPaced = async (lines, delayMs = 700) => {
    for (const line of lines) {
      boardApiRef.current?.writeLines?.([line]);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  };

  const onEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setSecondsRemaining(0);
  };

  const onSend = async (text) => {
    if (secondsRemaining <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "tutor",
          content: "This session has ended. Please start a new session to continue.",
        },
      ]);
      return;
    }

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const tutorIntro = {
      id: crypto.randomUUID(),
      role: "tutor",
      content: "Want me to show this on the board? (local demo)",
    };
    setMessages((prev) => [...prev, tutorIntro]);

    const steps = [
      `Goal: ${text}`,
      "1) Identify what is given.",
      "2) Apply the rule/formula.",
      "3) Solve and check.",
      "Answer: (demo placeholder)",
    ];

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
      controls={<SessionControlBar secondsRemaining={secondsRemaining} onEnd={onEnd} />}
    />
  );
}

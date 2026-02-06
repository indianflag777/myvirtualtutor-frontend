"use client";

import SessionShell from "../../components/session/SessionShell";
import WhiteboardPanel from "../../components/whiteboard/WhiteboardPanel";
import SessionControlBar from "../../components/session/SessionControlBar";

function TutorPanelPlaceholder() {
  return (
    <div style={{ padding: 16 }}>
      <h3>AI Tutor</h3>
      <p style={{ opacity: 0.7 }}>Tutor chat + voice will appear here.</p>
    </div>
  );
}

export default function SessionPage() {
  return (
    <SessionShell
      tutor={<TutorPanelPlaceholder />}
      whiteboard={<WhiteboardPanel />}
      controls={<SessionControlBar secondsRemaining={900} onEnd={() => alert("End session (placeholder)")} />}
    />
  );
}

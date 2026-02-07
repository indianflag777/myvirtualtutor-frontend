"use client";

import React from "react";

export default function TutorPanel({ messages = [], onSend = () => {} }) {
  const [text, setText] = React.useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <div style={styles.title}>AI Tutor</div>
        <div style={styles.subtitle}>Math • Grades 6–12</div>
      </div>

      <div style={styles.transcript}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            Ask a math question to begin.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              style={m.role === "user" ? styles.userRow : styles.tutorRow}
            >
              <div style={m.role === "user" ? styles.userBubble : styles.tutorBubble}>
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.composer}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question…"
          rows={2}
          style={styles.input}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button style={styles.sendBtn} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  top: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  title: { fontSize: 14, fontWeight: 700 },
  subtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  transcript: {
    flex: 1,
    minHeight: 0,
    padding: 14,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  empty: { opacity: 0.65, fontSize: 13 },

  userRow: { display: "flex", justifyContent: "flex-end" },
  tutorRow: { display: "flex", justifyContent: "flex-start" },

  userBubble: {
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 13,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
  },
  tutorBubble: {
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: 13,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
  },

  composer: {
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    resize: "none",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eef6",
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#e8eef6",
    cursor: "pointer",
    fontWeight: 700,
  },
};

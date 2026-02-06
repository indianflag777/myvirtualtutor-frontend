"use client";

export default function SessionControlBar({ secondsRemaining = 900, onEnd = () => {} }) {
  const mm = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const ss = String(secondsRemaining % 60).padStart(2, "0");

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.badge}>⏱ {mm}:{ss}</span>
        <span style={styles.subtle}>MVT session</span>
      </div>

      <div style={styles.right}>
        <button style={styles.endBtn} onClick={onEnd}>
          End Session
        </button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 13,
    fontWeight: 600,
  },
  subtle: {
    fontSize: 12,
    opacity: 0.75,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  endBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#e8eef6",
    cursor: "pointer",
    fontWeight: 600,
  },
};

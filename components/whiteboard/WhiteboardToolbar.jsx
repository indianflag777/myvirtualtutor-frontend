"use client";

export default function WhiteboardToolbar({ tool, setTool, onClear }) {
  return (
    <div style={styles.row}>
      <button onClick={() => setTool("pen")} style={tool === "pen" ? styles.active : styles.btn}>
        Pen
      </button>
      <button onClick={() => setTool("eraser")} style={tool === "eraser" ? styles.active : styles.btn}>
        Eraser
      </button>
      <button onClick={onClear} style={styles.btn}>
        Clear
      </button>
    </div>
  );
}

const styles = {
  row: { display: "flex", gap: 8 },
  btn: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eef6",
    cursor: "pointer",
    fontSize: 13,
  },
  active: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#e8eef6",
    cursor: "pointer",
    fontSize: 13,
  },
};

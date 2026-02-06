"use client";

import { useRef, useState } from "react";
import WhiteboardToolbar from "./WhiteboardToolbar";
import WhiteboardCanvas from "./WhiteboardCanvas";

export default function WhiteboardPanel() {
  const apiRef = useRef(null);
  const [tool, setTool] = useState("pen");

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <span style={styles.title}>Whiteboard</span>
        <WhiteboardToolbar
          tool={tool}
          setTool={setTool}
          onClear={() => apiRef.current?.clear()}
        />
      </div>

      <div style={styles.canvasWrap}>
        <WhiteboardCanvas apiRef={apiRef} tool={tool} />
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
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
  },
  canvasWrap: {
    flex: 1,
    minHeight: 0,
    padding: 12,
  },
};

"use client";

import React, { useEffect, useRef, useState } from "react";

export default function WhiteboardPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [lineWidth, setLineWidth] = useState(5);
  const [status, setStatus] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const move = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "black";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "black";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => setIsDrawing(false);

  const clearBoard = () => {
    const ctx = canvasRef.current.getContext("2d");
    const rect = containerRef.current.getBoundingClientRect();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setExplanation("");
  };

  const askAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStatus("Sending to AI…");
    setExplanation("");

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setStatus("Capture failed");
        return;
      }

      try {
        const form = new FormData();
        form.append("image", blob, `whiteboard-${Date.now()}.png`);

        const res = await fetch("http://localhost:3001/whiteboard/ask", {
          method: "POST",
          body: form,
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
          setStatus("AI error");
          return;
        }

        setStatus("AI responded ✅");
        setExplanation(json.explanation);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    }, "image/png");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, background: "#0b1220", color: "white" }}>
        <button onClick={() => setTool("pen")}>Pen</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>
        <input
          type="range"
          min="2"
          max="18"
          value={lineWidth}
          onChange={(e) => setLineWidth(+e.target.value)}
        />
        <button onClick={clearBoard}>Clear</button>
        <button onClick={askAI}>Ask AI</button>
        <span style={{ marginLeft: 12, fontSize: 13 }}>{status}</span>
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        <div
          ref={containerRef}
          style={{ flex: 2, background: "#111827", padding: 16 }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
            style={{
              width: "100%",
              height: "100%",
              background: "white",
              touchAction: "none",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            padding: 16,
            background: "#0b1220",
            color: "white",
            overflowY: "auto",
          }}
        >
          <strong>AI Explanation</strong>
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
            {explanation || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

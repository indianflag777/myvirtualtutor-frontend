"use client";

import { useEffect, useRef } from "react";

export default function WhiteboardCanvas({ apiRef, tool }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Cursor for tutor-written text (CSS pixel coordinates)
  const textCursor = useRef({ x: 16, y: 28, lineH: 24 });

  const fillBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, w, h);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // Reset cursor and repaint background on resize
      textCursor.current = { x: 16, y: 28, lineH: 24 };
      fillBackground();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!apiRef) return;

    apiRef.current = {
      clear() {
        textCursor.current = { x: 16, y: 28, lineH: 24 };
        fillBackground();
      },

      writeLines(lines = []) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;

        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = "16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.fillStyle = "#e8eef6";

        const maxW = Math.max(200, w - 32);

        for (const line of lines) {
          const words = String(line).split(" ");
          let cur = "";

          for (const word of words) {
            const test = cur ? cur + " " + word : word;
            if (ctx.measureText(test).width > maxW) {
              ctx.fillText(cur, textCursor.current.x, textCursor.current.y);
              textCursor.current.y += textCursor.current.lineH;
              cur = word;
            } else {
              cur = test;
            }
          }

          if (cur) {
            ctx.fillText(cur, textCursor.current.x, textCursor.current.y);
            textCursor.current.y += textCursor.current.lineH;
          }
        }

        ctx.restore();
      },
    };
  }, [apiRef]);

  const point = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = point(e);
  };

  const end = (e) => {
    e.preventDefault();
    drawing.current = false;
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");

    // Draw in CSS pixels with correct DPR transform
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const p = point(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#0b1020" : "#e8eef6";
    ctx.lineWidth = tool === "eraser" ? 18 : 4;

    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    last.current = p;
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        touchAction: "none",
        background: "#0b1020",
      }}
      onMouseDown={start}
      onMouseUp={end}
      onMouseLeave={end}
      onMouseMove={move}
      onTouchStart={start}
      onTouchEnd={end}
      onTouchMove={move}
    />
  );
}

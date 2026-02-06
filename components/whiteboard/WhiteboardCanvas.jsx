"use client";

import { useEffect, useRef } from "react";

export default function WhiteboardCanvas({ apiRef, tool }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, rect.width, rect.height);
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
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0b1020";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    const ctx = canvas.getContext("2d");
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

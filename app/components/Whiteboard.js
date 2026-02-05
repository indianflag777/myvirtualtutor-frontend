"use client";

import { useEffect, useRef } from "react";

export default function Whiteboard({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = data.board.width;
    canvas.height = data.board.height;

    // Background
    ctx.fillStyle = data.board.background || "#0b0f19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const defaults = data.defaults || {};

    const stroke = defaults.stroke || "#e6eaf2";
    const strokeWidth = defaults.strokeWidth || 2;
    const fill = defaults.fill || "transparent";
    const fontFamily = defaults.fontFamily || "Inter";
    const fontSize = defaults.fontSize || 24;

    for (const op of data.ops) {
      if (op.op === "clear") {
        ctx.fillStyle = data.board.background || "#0b0f19";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (op.op !== "add") continue;

      const p = op.props;

      ctx.strokeStyle = p.stroke || stroke;
      ctx.lineWidth = p.strokeWidth || strokeWidth;
      ctx.fillStyle = p.fill || fill;

      if (op.kind === "text") {
        ctx.fillStyle = p.color || stroke;
        ctx.font = `${p.fontWeight || 400} ${p.fontSize || fontSize}px ${fontFamily}`;
        ctx.fillText(p.text, p.x, p.y);
      }

      if (op.kind === "line") {
        ctx.beginPath();
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
        ctx.stroke();
      }

      if (op.kind === "rect") {
        if (p.fill && p.fill !== "transparent") {
          ctx.fillRect(p.x, p.y, p.w, p.h);
        }
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }

      if (op.kind === "fraction_bar") {
        const partWidth = p.w / p.denominator;

        for (let i = 0; i < p.denominator; i++) {
          const x = p.x + i * partWidth;

          if (i < p.numerator) {
            ctx.fillStyle = p.highlightColor || "rgba(43,91,215,0.3)";
            ctx.fillRect(x, p.y, partWidth, p.h);
          }

          ctx.strokeStyle = p.stroke || stroke;
          ctx.strokeRect(x, p.y, partWidth, p.h);
        }

        if (p.label) {
          ctx.fillStyle = stroke;
          ctx.font = `500 ${fontSize}px ${fontFamily}`;
          ctx.fillText(p.label, p.x, p.y + p.h + fontSize + 4);
        }
      }
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#0b0f19"
      }}
    />
  );
}

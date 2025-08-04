// components/HandCursor.tsx
"use client";
import { useEffect, useState } from "react";

const fingerFrames = [
  "/fingers/finger-1.png", // relaxed
  "/fingers/finger-2.png", // pressed
  "/fingers/finger-3.png", // thumb moves
  "/fingers/finger-1.png", // back to relaxed
];

export default function HandCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % fingerFrames.length);
    }, 500); // 500ms per frame

    return () => {
      window.removeEventListener("mousemove", move);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <img src={fingerFrames[frame]} alt="hand cursor" width={48} height={48} style={{ userSelect: "none" }} />
    </div>
  );
}

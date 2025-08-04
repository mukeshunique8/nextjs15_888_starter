"use client";
import { useEffect, useRef, useState } from "react";

export default function ScrollHandCursor() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsScrolling(false), 500);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isScrolling) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <img src="/fingers/one-finger.gif" alt="scroll cursor" width={48} height={48} />
    </div>
  );
}

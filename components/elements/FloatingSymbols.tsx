// components/FloatingSymbols.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const symbols = [, "✪", "⚡", "★", "✪", "ღ", "✘", "🌟", "✦", "♪", "☯", "✧", "♡", "♾️", "❤️"];

const FloatingSymbols = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const count = 30;
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 12 + Math.random() * 24,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
    }));
    setItems(generated);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 0],
            x: [`${item.x}%`, `${item.x + (Math.random() * 10 - 5)}%`],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute  text-white dark:text-slate-300"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: 0.2,
          }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingSymbols;

"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const motivationalStack = [
  "💻 Midnight Oil",
  "🔍 Endless Curiosity",
  "🐞 Relentless Debugging",
  "🌙 Stack Overflow Nights",
  "☕ 1000+ Coffee Cups",
  "❌ Failed Deployments",
  "💪 Unshakable Persistence",
  "⏳ Impossible Deadlines",
  "🔥 Burnout & Comebacks",
  "💡 Eureka Moments",
  "🏝️ Sacrificed Weekends",
  "🏢 Unpaid Internships",
  "📺 YouTube Tutorials",
  "💻 Broken Laptop Screens",
  "✖️ Rejected PRs",
  "😨 Imposter Syndrome",
  "🚀 Triumphant Deployments",
  "🎓 Self-Taught Genius",
  "📚 No CS Degree Hustle",
  "💤 Dreams > Sleep",
  "❤️ Passion > Paychecks",
  "⌨️ Code > Comfort",
  "🐛 Bug Squasher",
  "📖 Documentation Reader",
  "🏛️ Legacy Code Warrior",
  "⚔️ Tech Debt Slayer",
  "📈 Continuous Learner",
  "🙅 Never Give Up",
];

interface FloatingItem {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  duration: number;
}

export function MotivationalFloat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize items with random positions
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });

      const initialItems = motivationalStack.map((_, index) => ({
        id: `item-${index}`,
        x: Math.random() * width,
        y: Math.random() * height,
        rotate: Math.random() * 20 - 10,
        scale: 0.8 + Math.random() * 0.4,
        duration: 15 + Math.random() * 20,
      }));

      setItems(initialItems);
    }
  }, []);

  // Animate items to new random positions
  useEffect(() => {
    if (dimensions.width === 0 || items.length === 0) return;

    const newItems = items.map((item) => {
      const newX = Math.random() * dimensions.width;
      const newY = Math.random() * dimensions.height;
      const newRotate = Math.random() * 40 - 20;

      animate(item.x, newX, {
        duration: item.duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        onUpdate: (latest) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, x: latest } : i)));
        },
      });

      animate(item.y, newY, {
        duration: item.duration * 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        onUpdate: (latest) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, y: latest } : i)));
        },
      });

      animate(item.rotate, newRotate, {
        duration: item.duration * 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        onUpdate: (latest) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, rotate: latest } : i)));
        },
      });

      return item;
    });

    setItems(newItems);
  }, [dimensions, items.length]);

  return (
    <section className="relative py-32 overflow-hidden bg-background border-t border-border" style={{ minHeight: "80vh" }}>
      <div className="max-w-7xl mx-auto px-4 text-center mb-16">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-5xl font-bold mb-6">
          The <span className="text-primary">Developer</span> Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-3xl mx-auto"
        >
          Behind every line of code lies late nights, breakthroughs, and relentless passion.
        </motion.p>
      </div>

      <div ref={containerRef} className="relative w-full h-full mx-auto" style={{ height: "500px", maxWidth: "1200px" }}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            style={{
              x: item.x,
              y: item.y,
              rotate: item.rotate,
              scale: item.scale,
            }}
            whileHover={{
              scale: item.scale * 1.3,
              backgroundColor: "hsl(var(--primary))",
              color: "white",
              zIndex: 50,
              transition: { duration: 0.3 },
            }}
            className="absolute px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium shadow-sm cursor-default whitespace-nowrap"
          >
            {motivationalStack[index]}
          </motion.div>
        ))}

        {/* Background decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          animate={{
            x: [0, 200, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-xl"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-xl"
        />
      </div>
    </section>
  );
}

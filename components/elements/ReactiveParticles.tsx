"use client";
import { useRef, useEffect } from "react";

const symbols = ["☮", "✦", "★", "✧", "✺"];
// const symbol = [
//   "☠", // Skull (danger)
//   "💊", // Pill (drugs)
//   "🧪", // Chemical vial
//   "🚬", // Cigarette
//   "🍷", // Wine glass
//   "🥃", // Whiskey glass
//   "🛑", // Stop sign (warning)
//   "👁", // Eye (evil eye)
//   "🧟", // Zombie (bad energy)
//   "💨", // Smoke puff
//   "🔥", // Fire (toxicity)
//   "🪬", // Nazar (protection symbol – optional contrast)
//   "🕳", // Black hole (abyss)
// ];

const ReactiveParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles: any[] = [];
  const particleCount = 50;
  let mouse = { x: -1000, y: -1000, speed: 0 };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Init Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 14 + Math.random() * 14,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    // Track mouse + velocity
    let lastMouse = { x: 0, y: 0 };
    document.addEventListener("mousemove", (e) => {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      mouse.speed = Math.sqrt(dx * dx + dy * dy) / 10;
      lastMouse = { x: e.clientX, y: e.clientY };
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Animate
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Distance from cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Avoid mouse
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += Math.cos(angle) * force * 1.5;
          p.vy += Math.sin(angle) * force * 1.5;
        } else {
          // Natural oscillation
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }

        // Apply speed damping
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(p.symbol, p.x, p.y);
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ background: "transparent" }} />;
};

export default ReactiveParticles;

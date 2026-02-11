"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCountUp } from "@/hooks/use-count-up";
import { StatsBar } from "@/components/landing/stats-bar"; // Import StatsBar component

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      resize();
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.04)";
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.offsetWidth, y);
        ctx.stroke();
      }

      // Draw particles and connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Canvas animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Все нормы СП актуальны на 2026 год
        </div>

        {/* Main heading */}
        <h1 className="max-w-5xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Все расчёты инженера
          <br />
          <span className="text-primary">в одном месте</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Нормативы СП с интерактивными формулами, калькуляторы, чек-листы
          и автоматическая пояснительная записка. Считайте быстрее — проектируйте точнее.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/auth/sign-in" className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="h-13 w-full gap-2 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <span>
                Войти
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
          <Link href="/sp" className="w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 w-full gap-2 border-border bg-transparent px-8 text-base text-foreground hover:bg-secondary"
            >
              <span>
                <Play className="h-4 w-4" />
                Смотреть все СП
              </span>
            </Button>
          </Link>
        </div>

        {/* Animated Stats bar */}
        <StatsBar />
      </div>
    </section>
  );
}

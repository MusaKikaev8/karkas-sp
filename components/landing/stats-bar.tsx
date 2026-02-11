"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCountUp } from "@/hooks/use-count-up";

const stats = [
  { end: 50, suffix: "+", label: "Нормативов СП" },
  { end: 200, suffix: "+", label: "Калькуляторов" },
  { end: 10000, suffix: "+", label: "Инженеров" },
  { end: 24, suffix: "/7", label: "Доступ" },
];

function StatItem({ end, suffix, label, isVisible }: { end: number; suffix: string; label: string; isVisible: boolean }) {
  const count = useCountUp(end, isVisible, end > 1000 ? 2500 : 2000);

  const formatted = end >= 10000 ? count.toLocaleString("ru-RU") : count.toString();

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold tabular-nums text-foreground md:text-3xl">
        {formatted}{suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function StatsBar() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
      {stats.map((stat) => (
        <StatItem key={stat.label} {...stat} isVisible={isVisible} />
      ))}
    </div>
  );
}

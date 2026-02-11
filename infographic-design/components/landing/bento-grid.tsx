"use client";

import {
  Search,
  Zap,
  Link2,
  MessageSquare,
  Download,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const bentoItems = [
  {
    icon: Search,
    title: "Умный поиск по нормам",
    description:
      "Мгновенный поиск по всем СП. Находите нужный пункт за секунды, а не часы.",
    className: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
    visual: (
      <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 text-primary" />
          <span>{"Расчёт прочности стали по СП 16..."}</span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {["СП 16.13330.2017 п. 6.2.1", "СП 16.13330.2017 п. 7.1.3", "СП 16.13330.2017 п. 8.5.2"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="text-foreground">{item}</span>
              <span className="text-xs text-primary">Открыть</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Расчёт прямо в тексте",
    description:
      "Формулы из СП становятся интерактивными — введите значения и получите результат.",
    className: "lg:col-span-1",
    visual: (
      <div className="mt-4 rounded-xl border border-border bg-background/50 p-3">
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-primary">{"N"}</span>
          {" / "}
          <span className="text-primary">{"A"}</span>
          {" "}
          {"<"}
          {" "}
          <span className="text-primary">{"R_y"}</span>
          {" * "}
          <span className="text-primary">{"γ_c"}</span>
        </div>
        <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
          {"Результат: 215.4 МПа < 240 МПа"}
        </div>
      </div>
    ),
  },
  {
    icon: Link2,
    title: "Кросс-ссылки",
    description:
      "Ссылки между пунктами СП кликабельны. Навигация по нормам как в Wikipedia.",
    className: "lg:col-span-1",
    visual: null,
  },
  {
    icon: MessageSquare,
    title: "Комментарии инженеров",
    description:
      "Публичные и личные заметки к каждому пункту. Учитесь на опыте коллег.",
    className: "lg:col-span-1",
    visual: null,
  },
  {
    icon: Download,
    title: "Экспорт в DOCX/PDF",
    description:
      "Генерация пояснительной записки из ваших расчётов одним кликом.",
    className: "lg:col-span-1",
    visual: null,
  },
  {
    icon: ShieldCheck,
    title: "Актуальные нормы",
    description:
      "Все СП обновляются при выходе новых редакций. Вы всегда работаете с актуальной версией.",
    className: "sm:col-span-2 lg:col-span-2",
    visual: (
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "СП 16.13330.2017",
          "СП 20.13330.2016",
          "СП 22.13330.2016",
          "СП 63.13330.2018",
          "СП 64.13330.2017",
          "СП 70.13330.2012",
        ].map((sp) => (
          <span
            key={sp}
            className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
          >
            {sp}
          </span>
        ))}
      </div>
    ),
  },
];

export function BentoGrid() {
  return (
    <section id="bento" className="relative bg-background py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Ключевые преимущества
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Не просто справочник — рабочий инструмент
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bentoItems.map((item, i) => (
            <ScrollReveal key={item.title} animation="fade-up" delay={i * 80}>
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/30 ${item.className}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.visual}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

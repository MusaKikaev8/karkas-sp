"use client";

import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { X, Check, ArrowRight, Clock, AlertTriangle, DollarSign, FileText } from "lucide-react";

const rows = [
  {
    metric: "Поиск нужного пункта СП",
    icon: Clock,
    before: "15-30 мин (бумажная версия / PDF)",
    after: "5 секунд (умный поиск)",
  },
  {
    metric: "Выполнение расчёта по формуле",
    icon: Clock,
    before: "30-60 мин (Excel / вручную)",
    after: "2 мин (интерактивная формула)",
  },
  {
    metric: "Проверка всех пунктов нормы",
    icon: AlertTriangle,
    before: "Легко пропустить шаг",
    after: "Чек-лист не даст забыть",
  },
  {
    metric: "Оформление пояснительной записки",
    icon: FileText,
    before: "2-4 часа (Word вручную)",
    after: "1 клик — автогенерация DOCX",
  },
  {
    metric: "Актуальность используемых норм",
    icon: AlertTriangle,
    before: "Риск работы с устаревшими СП",
    after: "Всегда актуальная редакция",
  },
  {
    metric: "Стоимость ПО",
    icon: DollarSign,
    before: "от 50 000 ₽/год (ЛИРА, SCAD)",
    after: "от 0 ₽ (бесплатный тариф)",
  },
];

export function Comparison() {
  return (
    <section className="relative bg-card py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Сравнение
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              До и после НормаКалк
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Посмотрите, сколько времени и усилий экономит платформа на каждом этапе работы инженера
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-border">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-background">
              <div className="flex items-center gap-2 p-4 md:p-5">
                <span className="text-sm font-semibold text-foreground">Метрика</span>
              </div>
              <div className="flex items-center gap-2 border-l border-border bg-destructive/5 p-4 md:p-5">
                <X className="h-4 w-4 text-destructive" />
                <span className="text-sm font-semibold text-destructive">Без НормаКалк</span>
              </div>
              <div className="flex items-center gap-2 border-l border-border bg-primary/5 p-4 md:p-5">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">С НормаКалк</span>
              </div>
            </div>

            {/* Table rows */}
            {rows.map((row, i) => (
              <div
                key={row.metric}
                className={`grid grid-cols-[1fr_1fr_1fr] ${
                  i < rows.length - 1 ? "border-b border-border" : ""
                } transition-colors hover:bg-secondary/30`}
              >
                <div className="flex items-center gap-3 p-4 md:p-5">
                  <row.icon className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                  <span className="text-sm font-medium text-foreground">{row.metric}</span>
                </div>
                <div className="flex items-center border-l border-border bg-destructive/[0.02] p-4 md:p-5">
                  <span className="text-sm text-muted-foreground">{row.before}</span>
                </div>
                <div className="flex items-center border-l border-border bg-primary/[0.02] p-4 md:p-5">
                  <span className="text-sm font-medium text-primary">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Bottom CTA */}
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-10 flex justify-center">
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Начать экономить время
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

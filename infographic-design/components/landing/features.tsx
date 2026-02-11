"use client";

import {
  BookOpen,
  Calculator,
  ClipboardCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const features = [
  {
    icon: BookOpen,
    title: "Нормативы СП",
    description:
      "Полные тексты строительных правил с интерактивными формулами. Кликните на формулу — получите расчёт с вашими параметрами.",
    tag: "50+ документов",
    href: "/sp",
  },
  {
    icon: Calculator,
    title: "Калькуляторы",
    description:
      "Инженерные калькуляторы по всем разделам: металлоконструкции, железобетон, грунты, нагрузки и многое другое.",
    tag: "200+ расчётов",
    href: "/calculators",
  },
  {
    icon: ClipboardCheck,
    title: "Чек-листы",
    description:
      "Пошаговые чек-листы для типовых расчётов. Каждый шаг ведёт к нужному калькулятору — ничего не забудете.",
    tag: "Подписчикам",
    href: "/checklists",
  },
  {
    icon: FileText,
    title: "Пояснительная записка",
    description:
      "Автоматическая генерация пояснительной записки на основе выполненных расчётов. Экспорт в DOCX и PDF.",
    tag: "Новинка",
    href: "/dashboard/explanatory-notes",
  },
];

export function Features() {
  return (
    <section id="features" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Возможности платформы
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Всё что нужно инженеру
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              От строительных норм до готовой пояснительной записки — весь рабочий процесс в одном интерфейсе
            </p>
          </div>
        </ScrollReveal>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={i * 100}>
              <div
                className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
              >
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>

                {/* Tag */}
                <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {feature.tag}
                </span>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Link */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                  Подробнее
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

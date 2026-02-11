"use client";

import { ScrollReveal } from "@/components/landing/scroll-reveal";

const steps = [
  {
    number: "01",
    title: "Откройте норматив",
    description:
      "Найдите нужный СП и откройте конкретный пункт. Оглавление и поиск помогут сориентироваться мгновенно.",
  },
  {
    number: "02",
    title: "Выполните расчёт",
    description:
      "Формулы в тексте СП интерактивны — введите параметры и получите результат. Или используйте калькулятор из каталога.",
  },
  {
    number: "03",
    title: "Пройдите чек-лист",
    description:
      "Следуйте пошаговому чек-листу для вашей конструкции. Каждый шаг ведёт к нужному калькулятору — ничего не пропустите.",
  },
  {
    number: "04",
    title: "Скачайте записку",
    description:
      "Все выполненные расчёты автоматически собираются в пояснительную записку. Скачайте в DOCX или PDF.",
  },
];

export function HowItWorks() {
  return (
    <section id="calculators" className="relative bg-card py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Как это работает
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              От нормативов — к готовому документу за 4 шага
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} animation="fade-up" delay={i * 150}>
              <div className="relative flex flex-col">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-8 translate-x-full bg-gradient-to-r from-primary/40 to-transparent lg:block" />
                )}

                <span className="font-mono text-4xl font-bold text-primary/20">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

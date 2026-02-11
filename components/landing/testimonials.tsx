"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const testimonials = [
  {
    name: "Алексей Иванов",
    initials: "АИ",
    text: "Раньше на поиск нужного пункта СП и проверку формул уходило по 2-3 часа. С Каркас это занимает минуты. Пояснительная записка собирается автоматически — это просто находка.",
  },
  {
    name: "Марина Козлова",
    initials: "МК",
    text: "Чек-листы — это лучшее, что случилось с моим рабочим процессом за последние годы. Ни один расчёт не пропущен, всё по порядку, с ссылками на нужные калькуляторы.",
  },
  {
    name: "Дмитрий Петров",
    initials: "ДП",
    text: "Перевёл весь отдел из 8 человек на Каркас. Единый формат записок, общая база расчётов, актуальные нормы. Экспертиза проходит с первого раза.",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-card py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Отзывы
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Инженеры уже оценили
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} animation="fade-up" delay={i * 120}>
              <div
                className="relative flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/20"
              >
                <svg
                  className="mb-4 h-8 w-8 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t.text}
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                  <Avatar className="h-10 w-10 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const plans = [
  {
    name: "Бесплатно",
    price: "0",
    period: "навсегда",
    description: "Для знакомства с платформой",
    features: [
      "Все нормативы СП — полный текст",
      "5 калькуляторов в день",
      "Публичные комментарии",
      "История 10 расчётов",
    ],
    cta: "Начать бесплатно",
    popular: false,
  },
  {
    name: "Про",
    price: "990",
    period: "/мес",
    description: "Для практикующих инженеров",
    features: [
      "Всё из бесплатного тарифа",
      "Безлимитные калькуляторы",
      "Чек-листы по конструкциям",
      "Пояснительная записка (DOCX/PDF)",
      "Личные заметки и комментарии",
      "Безлимитная история расчётов",
      "Приоритетная поддержка",
    ],
    cta: "Подключить Про",
    popular: true,
  },
  {
    name: "Команда",
    price: "2 490",
    period: "/мес",
    description: "Для проектных бюро",
    features: [
      "Всё из Про тарифа",
      "До 10 пользователей",
      "Общие расчёты и шаблоны",
      "Брендированные документы",
      "API для интеграции",
      "Персональный менеджер",
    ],
    cta: "Связаться с нами",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-background py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Тарифы
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Прозрачные цены без скрытых платежей
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Начните бесплатно. Перейдите на Про, когда будете готовы.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} animation="fade-up" delay={i * 120}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Популярный
                  </span>
                )}

                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {plan.price !== "0" ? " \u20BD" : ""}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-8 h-12 w-full gap-2 text-sm font-semibold ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

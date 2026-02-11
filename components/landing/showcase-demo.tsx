"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const tabs = [
  {
    id: "norms",
    label: "Нормативы",
    content: {
      title: "СП 16.13330.2017",
      subtitle: "Стальные конструкции. Пункт 6.2.1",
      body: "Расчёт элементов стальных конструкций на прочность при центральном растяжении или сжатии силой N следует выполнять по формуле:",
      formula: "N / (A_n · R_y · γ_c) ≤ 1",
      fields: [
        { label: "N (кН)", value: "450" },
        { label: "A_n (см²)", value: "23.4" },
        { label: "R_y (МПа)", value: "240" },
        { label: "γ_c", value: "1.0" },
      ],
      result: "0.80 ≤ 1 — Прочность обеспечена",
      resultOk: true,
    },
  },
  {
    id: "calc",
    label: "Калькулятор",
    content: {
      title: "Момент инерции сечения",
      subtitle: "Двутавр по ГОСТ 26020-83",
      body: "Вычисление геометрических характеристик прокатного двутаврового сечения по указанным параметрам.",
      formula: "I_x = (b·h³ - (b-t_w)·(h-2·t_f)³) / 12",
      fields: [
        { label: "h (мм)", value: "300" },
        { label: "b (мм)", value: "150" },
        { label: "t_w (мм)", value: "8" },
        { label: "t_f (мм)", value: "12" },
      ],
      result: "I_x = 7 423 см⁴",
      resultOk: true,
    },
  },
  {
    id: "checklist",
    label: "Чек-лист",
    content: {
      title: "Расчёт стальной колонны",
      subtitle: "Пошаговый чек-лист (8 шагов)",
      body: "Выполните последовательные проверки для обеспечения несущей способности стальной колонны сплошного сечения.",
      formula: null,
      fields: null,
      result: null,
      resultOk: true,
      steps: [
        { text: "Сбор нагрузок по СП 20", done: true },
        { text: "Определение расчётной длины", done: true },
        { text: "Подбор сечения колонны", done: true },
        { text: "Проверка прочности (п. 6.2.1)", done: false },
        { text: "Проверка устойчивости (п. 7.1.3)", done: false },
      ],
    },
  },
];

export function ShowcaseDemo() {
  const [activeTab, setActiveTab] = useState("norms");
  const current = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="demo" className="relative bg-card py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Живой пример
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Попробуйте прямо сейчас
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Так выглядит работа с платформой. Нормативы, калькуляторы и чек-листы — всё в едином интерфейсе.
            </p>
          </div>
        </ScrollReveal>

        {/* Tab selector */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo card */}
        <ScrollReveal animation="fade-scale" delay={200}>
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-primary/5">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-destructive/50" />
                  <span className="h-3 w-3 rounded-full bg-chart-4/50" />
                  <span className="h-3 w-3 rounded-full bg-chart-2/50" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  karkas.app
                </span>
              </div>

              {/* Content area */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary"
                  >
                    {current.content.subtitle}
                  </Badge>
                </div>

                <h3 className="mt-4 text-xl font-bold text-foreground md:text-2xl">
                  {current.content.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {current.content.body}
                </p>

                {/* Formula */}
                {current.content.formula && (
                  <div className="mt-6 rounded-xl border border-border bg-card p-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Формула
                    </span>
                    <p className="mt-2 font-mono text-lg text-primary">
                      {current.content.formula}
                    </p>
                  </div>
                )}

                {/* Input fields */}
                {current.content.fields && (
                  <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {current.content.fields.map((field) => (
                      <div key={field.label} className="rounded-xl border border-border bg-card p-3">
                        <span className="text-xs text-muted-foreground">
                          {field.label}
                        </span>
                        <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Steps (checklist) */}
                {current.content.steps && (
                  <div className="mt-6 flex flex-col gap-2">
                    {current.content.steps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          step.done
                            ? "border-primary/20 bg-primary/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-muted-foreground"
                          }`}
                        >
                          {step.done ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            step.done
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {current.content.result && (
                  <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      Результат
                    </span>
                    <p className="mt-1 font-mono text-base font-semibold text-primary">
                      {current.content.result}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

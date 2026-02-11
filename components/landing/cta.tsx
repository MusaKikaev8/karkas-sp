"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function CTA() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-12 md:p-20">
          {/* Glow effect */}
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <ScrollReveal animation="fade-scale">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Начните считать быстрее уже сегодня
              </h2>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Зарегистрируйтесь бесплатно — получите доступ ко всем нормативам
                СП и 5 калькуляторам в день. Без карты, без обязательств.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-13 gap-2 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Создать аккаунт
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Бесплатно. Без карты. 30 секунд.
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

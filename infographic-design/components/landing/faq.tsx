"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const faqs = [
  {
    q: "Это замена ЛИРА-САПР или SCAD?",
    a: "Нет. НормаКалк не заменяет программные комплексы для конечно-элементного анализа. Мы решаем другую задачу: быстрый доступ к нормативам СП, ручные проверочные расчёты по формулам из норм, чек-листы и автоматическое оформление пояснительной записки. НормаКалк дополняет ваш основной инструмент.",
  },
  {
    q: "Какие нормативы доступны на платформе?",
    a: "На данный момент загружены более 50 СП по ключевым разделам: металлические конструкции, железобетон, деревянные и каменные конструкции, основания и фундаменты, нагрузки и воздействия, сейсмика и другие. Все документы поддерживаются в актуальной редакции — при выходе изменений мы обновляем тексты.",
  },
  {
    q: "Можно ли доверять результатам расчётов?",
    a: "Все формулы взяты напрямую из официальных текстов СП без изменений. Каждый калькулятор содержит ссылку на конкретный пункт нормы. Вы всегда можете проверить логику расчёта и сверить с первоисточником. НормаКалк — это инструмент для инженера, а не замена инженерного суждения.",
  },
  {
    q: "Как работает пояснительная записка?",
    a: "Когда вы выполняете расчёты через калькуляторы или чек-листы, результаты автоматически сохраняются в ваш проект. На основе этих данных формируется пояснительная записка — с формулами, исходными данными, результатами и ссылками на пункты СП. Экспорт доступен в DOCX и PDF.",
  },
  {
    q: "Есть ли бесплатный доступ?",
    a: "Да. Бесплатный тариф даёт полный доступ ко всем текстам нормативов СП и до 5 расчётов в день. Этого достаточно для знакомства с платформой. Для полноценной работы с чек-листами, безлимитными калькуляторами и генерацией записок рекомендуем тариф Про.",
  },
  {
    q: "Подходит ли НормаКалк для проектных бюро?",
    a: "Да, тариф Команда рассчитан на проектные организации до 10 человек. Вы получаете общую базу расчётов, единые шаблоны записок с брендированием вашей компании, API для интеграции с вашими системами и персонального менеджера.",
  },
  {
    q: "Работает ли платформа офлайн?",
    a: "На данный момент НормаКалк — это веб-приложение, для работы нужен интернет. Однако вы можете в любой момент скачать пояснительную записку или результаты расчётов в DOCX/PDF и работать с ними офлайн. В планах — PWA-версия с базовым офлайн-доступом.",
  },
  {
    q: "Как обеспечивается безопасность данных?",
    a: "Все данные хранятся на серверах в России. Подключение шифруется по протоколу TLS. Расчёты и проекты привязаны к вашему аккаунту и не видны другим пользователям (если вы не предоставили доступ). Для команд доступно управление правами доступа.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative bg-background py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Вопросы и ответы
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Частые вопросы
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Не нашли ответ? Напишите нам в Telegram — ответим в течение часа.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <div className="mx-auto mt-16 max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-6 transition-colors data-[state=open]:border-primary/20 data-[state=open]:bg-primary/[0.02]"
                >
                  <AccordionTrigger className="py-5 text-left text-sm font-semibold text-foreground hover:no-underline md:text-base [&[data-state=open]]:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

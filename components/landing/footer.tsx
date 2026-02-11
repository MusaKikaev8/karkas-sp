export function Footer() {
  const columns = [
    {
      title: "Платформа",
      links: [
        { label: "Нормативы СП", href: "/sp" },
        { label: "Калькуляторы", href: "/calculators" },
        { label: "Чек-листы", href: "/checklists" },
        { label: "Мои расчёты", href: "/dashboard" },
      ],
    },
    {
      title: "Ресурсы",
      links: [
        { label: "Документация", href: "#" },
        { label: "Блог", href: "#" },
        { label: "Обновления", href: "#" },
        { label: "FAQ", href: "#" },
      ],
    },
    {
      title: "Компания",
      links: [
        { label: "О нас", href: "#" },
        { label: "Контакты", href: "#" },
        { label: "Вакансии", href: "#" },
        { label: "Партнёрам", href: "#" },
      ],
    },
    {
      title: "Правовое",
      links: [
        { label: "Условия использования", href: "/terms" },
        { label: "Политика конфиденциальности", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <rect x="4" y="3" width="16" height="3" rx="0.5" fill="currentColor" />
                  <rect x="10" y="6" width="4" height="12" fill="currentColor" />
                  <rect x="4" y="18" width="16" height="3" rx="0.5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-bold uppercase tracking-widest text-foreground">
                КАРКАС
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Платформа для инженеров-проектировщиков. Нормативы, расчёты и
              документация в одном месте.
            </p>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              {"2024-2026 Каркас. Все права защищены."}
            </p>
          <div className="flex items-center gap-4">
            <a
              href="https://t.me/musakikaev_8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Telegram"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295-.393 0-.32-.148-.451-.524l-1.004-3.296-2.952-.924c-.644-.213-.657-.643.136-.953l11.506-4.431c.531-.195 1.062.131.926.953z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="YouTube"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

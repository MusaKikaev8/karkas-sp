export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold text-foreground mb-8">Политика конфиденциальности</h1>

        <div className="prose prose-invert max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Собираемые данные</h2>
            <p className="text-muted-foreground">
              При использовании платформы КАРКАС мы собираем:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email адрес и пароль (при регистрации)</li>
              <li>Ваши расчеты и сохраненные данные</li>
              <li>IP адрес и браузерную информацию</li>
              <li>Время и способ использования сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Как мы используем ваши данные</h2>
            <p className="text-muted-foreground">Мы используем собираемые данные для:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Предоставления и улучшения сервиса</li>
              <li>Отправки важных уведомлений об обновлениях</li>
              <li>Анализа использования для оптимизации</li>
              <li>Безопасности и предотвращения мошенничества</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Защита данных</h2>
            <p className="text-muted-foreground">
              Мы используем шифрование HTTPS и стандарты безопасности для защиты ваших данных. Все пароли хранятся в защищенном виде. Однако полная безопасность в интернете невозможна.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Общий доступ данных</h2>
            <p className="text-muted-foreground">
              Мы НЕ продаем и НЕ передаем ваши личные данные третьим лицам. Исключение составляют случаи, когда это требуется законом.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Файлы cookies</h2>
            <p className="text-muted-foreground">
              Мы используем cookies для улучшения пользовательского опыта. Вы можете отключить cookies в настройках браузера.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Удаление аккаунта</h2>
            <p className="text-muted-foreground">
              Вы можете запросить удаление вашего аккаунта и все связанные данные в любой момент. Обратитесь к нам через Telegram.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Изменения политики</h2>
            <p className="text-muted-foreground">
              Мы можем обновлять эту политику. Уведомление об изменении будет опубликовано на этой странице.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Контакты</h2>
            <p className="text-muted-foreground">
              По вопросам конфиденциальности свяжитесь с нами: @musakikaev_8 (Telegram)
            </p>
          </section>

          <p className="text-xs text-muted-foreground mt-12 pt-8 border-t border-border">
            Последнее изменение: февраль 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold text-foreground mb-8">Условия использования</h1>

        <div className="prose prose-invert max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Согласие с условиями</h2>
            <p className="text-muted-foreground">
              Используя платформу КАРКАС, вы принимаете настоящие Условия использования. Если вы не согласны с какой-либо частью этих условий, пожалуйста, не используйте наш сервис.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Авторские права и интеллектуальная собственность</h2>
            <p className="text-muted-foreground">
              Все содержимое платформы (тексты, формулы, калькуляторы, дизайн) защищено авторским правом и принадлежит компании КАРКАС. Вы вправе использовать контент только в личных и образовательных целях.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Ограничение ответственности</h2>
            <p className="text-muted-foreground">
              Калькуляторы и расчеты предоставляются в справочных целях. Проверьте все расчеты перед использованием их в реальных проектах. Компания КАРКАС не несет ответственность за ошибки в расчетах или любой ущерб, вызванный использованием платформы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Запрещенная деятельность</h2>
            <p className="text-muted-foreground">Вы обязуетесь:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Не использовать сервис для незаконных целей</li>
              <li>Не загружать вредоносное ПО или вирусы</li>
              <li>Не пытаться взломать или обойти защиту</li>
              <li>Не публиковать оскорбительный, расистский или дискриминационный контент</li>
              <li>Не спамить комментариями</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Изменение условий</h2>
            <p className="text-muted-foreground">
              Мы можем изменять эти условия в любое время. Продолжение использования платформы после изменений означает согласие с новыми условиями.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Контакты</h2>
            <p className="text-muted-foreground">
              По вопросам относительно этих условий пожалуйста свяжитесь с нами через Telegram: @musakikaev_8
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

import Link from "next/link";

export default async function ChecklistWizardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="grid gap-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Чек‑лист
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Мастер: {slug}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
          Заглушка. Здесь будет пошаговый сценарий расчёта с переходами к
          калькуляторам.
        </p>
        <div className="mt-4">
          <Link
            href="/checklists"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Назад
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        TODO: шаги, валидация, связь со СП и калькуляторами.
      </div>
    </div>
  );
}

export const metadata = {
  title: "Модерация комментариев",
};

export default function AdminCommentsPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Админка: комментарии
        </h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Заглушка под модерацию публичных комментариев.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        TODO: таблица, фильтры, статусы модерации.
      </div>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Админ-панель",
};

export default function AdminHomePage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Админ-панель</h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Управление контентом и данными платформы
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/sp"
          className="rounded-2xl border border-zinc-300 p-6 transition-colors hover:border-primary/30 dark:border-zinc-700"
        >
          <h2 className="text-lg font-semibold">Своды правил</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Создание и редактирование СП
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl border border-zinc-300 p-6 transition-colors hover:border-primary/30 dark:border-zinc-700"
        >
          <h2 className="text-lg font-semibold">Пользователи</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Управление аккаунтами и ролями
          </p>
        </Link>

        <Link
          href="/admin/comments"
          className="rounded-2xl border border-zinc-300 p-6 transition-colors hover:border-primary/30 dark:border-zinc-700"
        >
          <h2 className="text-lg font-semibold">Комментарии</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Модерация пользовательских комментариев
          </p>
        </Link>
      </div>
    </div>
  );
}

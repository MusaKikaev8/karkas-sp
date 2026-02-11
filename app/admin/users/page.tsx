export const metadata = {
  title: "Пользователи",
};

export default function AdminUsersPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Админка: пользователи</h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Заглушка под управление пользователями/подписками.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        TODO: список пользователей и статусы подписок.
      </div>
    </div>
  );
}

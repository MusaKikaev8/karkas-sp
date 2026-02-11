import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth/sign-in");
  }

  const { data: isFounder, error: founderError } = await supabase.rpc(
    "is_founder"
  );

  if (founderError || !isFounder) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">
            Нет доступа к админке
          </h1>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            Требуются права администратора. Обратитесь к владельцу проекта.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              На главную
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Войти другим аккаунтом
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-lg font-semibold">
                КАРКАС
              </Link>
              <div className="flex items-center gap-1 text-sm">
                <Link
                  href="/admin/sp"
                  className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Своды правил
                </Link>
                <Link
                  href="/admin/users"
                  className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Пользователи
                </Link>
                <Link
                  href="/admin/comments"
                  className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Комментарии
                </Link>
              </div>
            </div>
            <Link
              href="/"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              На сайт →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

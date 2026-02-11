"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MeResponse =
  | { ok: true; user: { id: string; email?: string | null } | null; isFounder: boolean }
  | { ok: false; error: string };

export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFounder, setIsFounder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError(
          "Supabase не настроен: заполните .env.local и перезапустите dev-сервер."
        );
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;

        setEmail(data.user?.email ?? null);
        setUserId(data.user?.id ?? null);

        const session = (await supabase.auth.getSession()).data.session;
        const meResp = await fetch("/api/me", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
          cache: "no-store",
        });
        const json = (await meResp.json()) as MeResponse;
        if (cancelled) return;

        if (json.ok) setIsFounder(Boolean(json.isFounder));
        else setIsFounder(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Не удалось загрузить профиль");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Статус сессии и роль founder (для редактирования официального текста).
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка…</div>
        ) : null}
        {error ? (
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        ) : null}

        {!loading && !error && !userId ? (
          <div className="grid gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Вы не вошли.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/sign-in"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Войти
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Регистрация
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error && userId ? (
          <div className="grid gap-2">
            <div className="text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Email:</span>{" "}
              <span className="font-medium">{email ?? "(нет)"}</span>
            </div>
            <div className="text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">User ID:</span>{" "}
              <span className="font-mono text-xs">{userId}</span>
            </div>
            <div className="text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Founder:</span>{" "}
              <span className="font-medium">
                {isFounder
                  ? "да (можно редактировать официальный текст)"
                  : "нет"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                onClick={signOut}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Выйти
              </button>
              <Link
                href="/sp"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Перейти к СП
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

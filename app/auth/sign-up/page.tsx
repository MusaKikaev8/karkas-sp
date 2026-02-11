"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!supabase) {
      setError(
        "Supabase не настроен: заполните .env.local и перезапустите dev-сервер."
      );
      return;
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      setError("Введите email и пароль.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailTrimmed,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && !data.session) {
        setOk(
          "Аккаунт создан. Проверьте почту (возможно, нужно подтвердить email), затем войдите."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Регистрация через Supabase (email + пароль).
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="grid gap-1">
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Пароль
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
        </label>

        {error ? (
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        ) : null}
        {ok ? (
          <div className="text-sm text-emerald-700 dark:text-emerald-300">
            {ok}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {loading ? "Создаём…" : "Создать аккаунт"}
          </button>
          <Link
            href="/auth/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Уже есть аккаунт
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            На главную
          </Link>
        </div>
      </form>
    </div>
  );
}

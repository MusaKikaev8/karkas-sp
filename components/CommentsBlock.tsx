"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type EntityType = "clause" | "calc";

type Entity = {
  type: EntityType;
  key: string;
};

type ApiComment = {
  id: string;
  entity_type: EntityType;
  entity_key: string;
  author_id: string;
  body: string;
  visibility: "public" | "pending" | "private";
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

type CommentsResponse = {
  ok: boolean;
  error?: string;
  user: { id: string; email?: string | null } | null;
  isFounder: boolean;
  comments: {
    public: ApiComment[];
    mine: ApiComment[];
    pending: ApiComment[];
  };
};

export function CommentsBlock({
  entity,
  title = "Комментарии",
}: {
  entity: Entity;
  title?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [tab, setTab] = useState<"public" | "mine" | "pending">("public");
  const [text, setText] = useState("");
  const [submitMode, setSubmitMode] = useState<"pending" | "private" | "public">(
    "pending"
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(
    null
  );
  const [isFounder, setIsFounder] = useState(false);
  const [comments, setComments] = useState<CommentsResponse["comments"]>({
    public: [],
    mine: [],
    pending: [],
  });

  async function getAuthHeader(): Promise<string | null> {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ? `Bearer ${session.access_token}` : null;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const auth = await getAuthHeader();
      const qs = new URLSearchParams({
        entityType: entity.type,
        entityKey: entity.key,
      });

      const res = await fetch(`/api/comments?${qs.toString()}`, {
        headers: auth ? { Authorization: auth } : {},
      });
      const json = (await res.json()) as CommentsResponse;
      if (!json.ok) throw new Error(json.error || "failed_to_load");

      setUser(json.user);
      setIsFounder(Boolean(json.isFounder));
      setComments(json.comments);

      if (!json.user && tab !== "public") setTab("public");
      if (!json.isFounder && tab === "pending" && json.user) {
        // for non-founder, pending tab shows only own pending
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed_to_load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.type, entity.key]);

  const visible = useMemo(() => {
    if (tab === "public") return comments.public;
    if (tab === "mine") return comments.mine;
    return comments.pending;
  }, [comments, tab]);

  async function handleSave() {
    const value = text.trim();
    if (!value) {
      setError("Введите текст комментария.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const auth = await getAuthHeader();
      if (!auth) {
        setError("Нужно войти, чтобы оставлять комментарии.");
        return;
      }

      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({
          entityType: entity.type,
          entityKey: entity.key,
          body: value,
          visibility: submitMode,
        }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "failed_to_save");

      setText("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed_to_save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(commentId: string) {
    setSubmitting(true);
    setError(null);
    try {
      const auth = await getAuthHeader();
      if (!auth) {
        setError("Нужно войти.");
        return;
      }

      const res = await fetch(`/api/comments/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({ commentId }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "failed_to_approve");

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed_to_approve");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    setSubmitting(true);
    setError(null);
    try {
      const auth = await getAuthHeader();
      if (!auth) {
        setError("Нужно войти.");
        return;
      }

      const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
        method: "DELETE",
        headers: { Authorization: auth },
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "failed_to_delete");

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed_to_delete");
    } finally {
      setSubmitting(false);
    }
  }

  if (!supabase) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Требуется настроить Supabase.
            </div>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            Не найдены переменные окружения Supabase. Создайте файл
            <span className="font-mono text-xs"> .env.local </span>
            по примеру
            <span className="font-mono text-xs"> .env.local.example </span>
            и перезапустите dev-сервер.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Хранится в базе (Supabase). Публичные видны всем.
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          {([
            { key: "public", label: "Публичные", disabled: false },
            { key: "mine", label: "Мои", disabled: !user },
            {
              key: "pending",
              label: "На модерации",
              disabled: !user,
            },
          ] as const).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.disabled) return;
                setTab(item.key);
              }}
              disabled={item.disabled}
              className={
                "h-9 rounded-lg px-3 transition " +
                (tab === item.key
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                  : item.disabled
                    ? "cursor-not-allowed text-zinc-400 dark:text-zinc-600"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800")
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {!supabase ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Supabase не настроен: добавьте `NEXT_PUBLIC_SUPABASE_URL` и
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`.
          </div>
        ) : null}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Ваш комментарий…"
          disabled={!supabase || !user || submitting}
          className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
        />
        {error ? (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : null}
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {!user ? (
              <span>
                Войдите, чтобы комментировать. (
                <a className="underline" href="/auth/sign-in">
                  вход
                </a>
                )
              </span>
            ) : (
              <span>
                Режим: <span className="font-medium">{submitMode}</span>
                {isFounder ? (
                  <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                    (founder)
                  </span>
                ) : null}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={submitMode}
              onChange={(e) => setSubmitMode(e.target.value as typeof submitMode)}
              disabled={!supabase || !user || submitting}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="pending">на модерацию</option>
              <option value="private">личный</option>
              {isFounder ? <option value="public">публичный</option> : null}
            </select>

          <button
            type="button"
            onClick={handleSave}
            disabled={!supabase || !user || submitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {submitting ? "…" : "Отправить"}
          </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold">Список</div>
        {loading ? (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Загрузка…
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Пока нет комментариев.
          </div>
        ) : (
          <ul className="mt-2 grid gap-2">
            {visible.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="whitespace-pre-wrap leading-6">{c.body}</div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                      {c.visibility}
                    </span>
                    {isFounder && c.visibility === "pending" ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleApprove(c.id)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Approve
                      </button>
                    ) : null}
                    {user && (isFounder || c.author_id === user.id) ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleDelete(c.id)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Удалить
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

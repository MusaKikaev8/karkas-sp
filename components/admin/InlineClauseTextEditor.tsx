"use client";

import { useEffect, useState } from "react";

type ClauseText = {
  sp_code: string;
  clause_id: string;
  content_md: string;
  source_url: string;
  updated_at: string;
  updated_by: string | null;
};

export function InlineClauseTextEditor({
  spCode,
  clauseId,
  defaultSourceUrl,
}: {
  spCode: string;
  clauseId: string;
  defaultSourceUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState(defaultSourceUrl);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setOk(false);
      try {
        const qs = new URLSearchParams({
          spCode,
          clauseId,
        });
        const res = await fetch(`/api/sp-clause-text?${qs.toString()}`);
        const json = (await res.json().catch(() => null)) as
          | { ok: true; text: ClauseText | null }
          | { ok: false; error: string }
          | null;

        if (!cancelled) {
          const text = json && "ok" in json && json.ok ? json.text : null;
          setContent(text?.content_md ?? "");
          setSourceUrl(text?.source_url ?? defaultSourceUrl);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, spCode, clauseId, defaultSourceUrl]);

  async function handleSave() {
    setError(null);
    setOk(false);

    const contentTrimmed = content.trim();
    const sourceTrimmed = sourceUrl.trim();
    if (!contentTrimmed) {
      setError("Нужно заполнить текст.");
      return;
    }
    if (!sourceTrimmed) {
      setError("Нужно указать ссылку на источник.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sp-clause-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spCode,
          clauseId,
          contentMd: contentTrimmed,
          sourceUrl: sourceTrimmed,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; text: ClauseText }
        | { ok: false; error: string }
        | null;

      if (!res.ok || !json || !("ok" in json) || !json.ok) {
        setError(json && "error" in json ? json.error : "Ошибка сохранения");
        return;
      }

      setOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex text-xs text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
      >
        {open ? "Скрыть редактор" : "Редактировать официальный текст"}
      </button>

      {open ? (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Ссылка на официальный источник
              </div>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder={defaultSourceUrl}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </label>

            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Официальный текст (можно Markdown)
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Вставьте официальный текст пункта."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </label>

            {loading ? (
              <div className="text-xs text-zinc-500">Загрузка...</div>
            ) : null}
            {error ? (
              <div className="text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}
            {ok ? (
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                Сохранено.
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOk(false);
                  setContent("");
                  setSourceUrl(defaultSourceUrl);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

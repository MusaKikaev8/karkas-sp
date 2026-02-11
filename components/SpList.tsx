"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SpItem, SpStatus } from "@/lib/sp-data";
import { normalizeSpCode } from "@/lib/utils/sp-code";

const ALL: SpStatus | "все" = "все";

export function SpList({ items }: { items: SpItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SpStatus | "все">(ALL);
  const [remoteResults, setRemoteResults] = useState<
    | null
    | Array<
        | {
            type: "document";
            code: string;
            title: string;
            year: number;
            status: string;
          }
        | {
            type: "clause" | "subclause";
            code: string;
            clauseId: string;
            title: string;
            parentClauseId?: string;
          }
        | {
            type: "text";
            code: string;
            clauseId: string;
            snippet: string;
          }
        | {
            type: "image";
            code: string;
            clauseId: string;
            title: string;
          }
      >
  >(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((sp) => (status === ALL ? true : sp.status === status))
      .filter((sp) => {
        if (!q) return true;
        return (
          sp.code.toLowerCase().includes(q) ||
          sp.title.toLowerCase().includes(q) ||
          String(sp.year).includes(q)
        );
      });
  }, [items, query, status]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRemoteResults(null);
      setRemoteError(null);
      setRemoteLoading(false);
      return;
    }

    let cancelled = false;
    async function run() {
      setRemoteLoading(true);
      setRemoteError(null);
      try {
        const qs = new URLSearchParams({
          q,
          status,
        });
        const res = await fetch(`/api/search?${qs.toString()}`);
        const json = (await res.json().catch(() => null)) as
          | { ok: true; results: typeof remoteResults }
          | { ok: false; error: string }
          | null;
        if (!cancelled) {
          if (!res.ok || !json || !("ok" in json) || !json.ok) {
            setRemoteError("Ошибка поиска");
            setRemoteResults([]);
          } else {
            setRemoteResults(json.results || []);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setRemoteError("Ошибка поиска");
          setRemoteResults([]);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [query, status]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">
            Поиск
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="например: СП 20, бетон, 2018…"
            className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400">
            Статус
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SpStatus | "все")}
            className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
          >
            <option value="все">Все</option>
            <option value="действует">Действует</option>
            <option value="проект">Проект</option>
            <option value="утратил силу">Утратил силу</option>
          </select>
        </div>
      </div>

      {remoteResults ? (
        <div className="grid gap-3">
          {remoteLoading ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              Поиск...
            </div>
          ) : null}
          {remoteError ? (
            <div className="rounded-2xl border border-dashed border-red-300 p-6 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
              {remoteError}
            </div>
          ) : null}
          {!remoteLoading && remoteResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              Ничего не найдено. Попробуйте изменить запрос.
            </div>
          ) : null}
          {remoteResults.map((r, idx) => {
            const normalizedCode = normalizeSpCode(r.code);
            const clauseId = "clauseId" in r ? r.clauseId : null;
            const href = `/sp/${encodeURIComponent(normalizedCode)}${
              clauseId ? `?clause=${encodeURIComponent(clauseId)}` : ""
            }`;
            
            const typeLabel = 
              r.type === "document" ? "СП" :
              r.type === "clause" ? "Пункт" :
              r.type === "subclause" ? "Подпункт" :
              r.type === "image" ? "Рисунок" :
              "Текст";

            return (
              <Link
                key={`${r.type}-${normalizedCode}-${idx}`}
                href={href}
                className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {typeLabel}
                    </div>
                    <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                      {"title" in r ? r.title : `Пункт ${r.clauseId}`}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {normalizedCode}
                      {clauseId ? ` · ${clauseId}` : ""}
                    </div>
                    {"snippet" in r && r.snippet ? (
                      <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {r.snippet}
                      </div>
                    ) : null}
                  </div>
                  {r.type === "document" ? (
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                      {r.year}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sp) => {
            const normalizedCode = normalizeSpCode(sp.code);
            return (
              <Link
                key={sp.code}
                href={`/sp/${encodeURIComponent(normalizedCode)}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {sp.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      Код: {normalizedCode}
                    </div>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                    {sp.year}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Статус: <span className="font-medium">{sp.status}</span>
                  </span>
                  <span className="text-xs font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                    Открыть →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !remoteResults ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Ничего не найдено. Попробуйте изменить запрос/фильтр.
        </div>
      ) : null}
    </div>
  );
}

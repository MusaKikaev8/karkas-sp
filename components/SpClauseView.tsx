"use client";

import Link from "next/link";
import katex from "katex";
import { useEffect, useState } from "react";
import { FormulaBlockView } from "@/components/FormulaBlockView";
import { SpTableView } from "@/components/SpTableView";
import { SpImagesView } from "@/components/SpImagesView";
import { getFormulaBlocks } from "@/lib/formulas/registry";
import type { SpClause } from "@/lib/sp-data";

type MeResponse =
  | { ok: true; user: { id: string; email?: string | null } | null; isFounder: boolean }
  | { ok: false; error: string };

type ClauseText = {
  sp_code: string;
  clause_id: string;
  content_md: string;
  source_url: string;
  updated_at: string;
  updated_by: string | null;
};

function cleanLatex(input: string): string {
  return String(input)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidClauseId(id: string): boolean {
  const parts = id.split(".");
  if (parts.length === 0 || parts.length > 4) return false;
  for (const p of parts) {
    if (!/^[0-9]+$/.test(p)) return false;
    if (p.length > 1 && p.startsWith("0")) return false;
    const n = Number(p);
    if (!Number.isFinite(n) || n < 1) return false;
  }
  const top = Number(parts[0]);
  return top >= 1 && top <= 20;
}

function linkifyClauseRefs(text: string, spCode: string) {
  // Split keeping clause-like tokens
  const re = /(\b\d+(?:\.\d+){1,3}\b)/g;
  const parts = String(text).split(re);
  return parts.map((part, idx) => {
    if (idx % 2 === 1 && isValidClauseId(part)) {
      return (
        <Link
          key={`${idx}:${part}`}
          href={`/sp/${encodeURIComponent(spCode)}?clause=${encodeURIComponent(part)}`}
          className="underline underline-offset-2"
        >
          {part}
        </Link>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function renderOfficialContent(contentMd: string, spCode: string) {
  // Support $$...$$ blocks for display-math formulas.
  const raw = String(contentMd ?? "");
  const chunks = raw.split("$$");

  return (
    <div className="grid gap-3">
      {chunks.map((chunk, idx) => {
        const isMath = idx % 2 === 1;
        if (!isMath) {
          return (
            <div
              key={idx}
              className="whitespace-pre-wrap text-sm leading-6 text-zinc-800 dark:text-zinc-200"
            >
              {linkifyClauseRefs(chunk, spCode)}
            </div>
          );
        }

        const latex = cleanLatex(chunk);
        const html = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          strict: "ignore",
        });

        return (
          <div
            key={idx}
            className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

export function SpClauseView({
  code,
  clause,
  spSourceUrl,
  allowEdit = false,
}: {
  code: string;
  clause: SpClause;
  spSourceUrl: string;
  allowEdit?: boolean;
}) {
  const [official, setOfficial] = useState<ClauseText | null>(null);
  const [loading, setLoading] = useState(false);

  const [isFounder, setIsFounder] = useState(false);
  const [meLoading, setMeLoading] = useState(false);

  const [editContent, setEditContent] = useState("");
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          spCode: code,
          clauseId: clause.id,
        });
        const res = await fetch(`/api/sp-clause-text?${qs.toString()}`);
        const json = (await res.json().catch(() => null)) as
          | { ok: boolean; text: ClauseText | null }
          | null;
        if (!cancelled) setOfficial(json?.ok ? json.text : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [code, clause.id]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setMeLoading(true);
      try {
        const res = await fetch("/api/me");
        const json = (await res.json().catch(() => null)) as MeResponse | null;
        if (cancelled) return;
        setIsFounder(Boolean(json && "ok" in json && json.ok && json.isFounder));
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSaveError(null);
    setSaveOk(false);
    setEditContent(official?.content_md ?? "");
    setEditSourceUrl(official?.source_url ?? spSourceUrl);
  }, [official, spSourceUrl, code, clause.id]);

  const sourceUrl = official?.source_url || spSourceUrl;
  const formulaBlocks = clause.formulaBlockIds?.length
    ? getFormulaBlocks(clause.formulaBlockIds)
    : [];

  async function handleSaveOfficial() {
    setSaveOk(false);
    setSaveError(null);

    const contentMd = editContent.trim();
    const sourceUrlTrimmed = editSourceUrl.trim();

    if (!contentMd) {
      setSaveError("Нужно заполнить текст (Markdown/обычный текст).");
      return;
    }
    if (!sourceUrlTrimmed) {
      setSaveError("Нужно указать ссылку на официальный источник.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sp-clause-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spCode: code,
          clauseId: clause.id,
          contentMd,
          sourceUrl: sourceUrlTrimmed,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; text: ClauseText }
        | { ok: false; error: string }
        | null;

      if (!res.ok || !json || !json.ok) {
        setSaveError(json && "error" in json ? json.error : "Ошибка сохранения");
        return;
      }

      setOfficial(json.text);
      setSaveOk(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Пункт {clause.id}
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {clause.title}
          </h1>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Официальный текст пункта</div>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Официальный источник
          </a>
        </div>
        {loading ? (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Загрузка…</div>
        ) : official ? (
          <div className="mt-2">{renderOfficialContent(official.content_md, code)}</div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Текст пока не внесён founder’ом. Ниже — краткое пояснение.
          </div>
        )}
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        {clause.summary}
      </p>

      <SpImagesView spCode={code} clauseId={clause.id} />

      {meLoading ? null : isFounder ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold">
              Founder: редактирование официального текста
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Сохраняется в Supabase (таблица sp_clause_texts)
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Ссылка на официальный источник
              </div>
              <input
                value={editSourceUrl}
                onChange={(e) => setEditSourceUrl(e.target.value)}
                placeholder={spSourceUrl}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </label>

            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Официальный текст (можно Markdown)
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                placeholder="Вставьте официальный текст пункта."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </label>

            {saveError ? (
              <div className="text-sm text-red-700 dark:text-red-300">{saveError}</div>
            ) : null}
            {saveOk ? (
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                Сохранено.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveOfficial}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setSaveOk(false);
                  setEditContent(official?.content_md ?? "");
                  setEditSourceUrl(official?.source_url ?? spSourceUrl);
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {formulaBlocks.length > 0 ? (
        <div className="mt-6">
          <div className="text-sm font-semibold">Формулы и быстрые расчёты</div>
          <div className="mt-3 grid gap-4">
            {formulaBlocks.map((b) => (
              <FormulaBlockView key={b.id} block={b} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="text-sm font-semibold mb-3">Нормативные таблицы</div>
        <SpTableView spCode={code} clauseId={clause.id} />
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold">Связанные калькуляторы</div>
        {clause.calculators.length === 0 ? (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Пока нет калькуляторов для этого пункта.
          </div>
        ) : (
          <ul className="mt-2 grid gap-2">
            {clause.calculators.map((calc) => (
              <li key={calc.slug}>
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
                  href={`/sp/${code}/calc/${calc.slug}`}
                >
                  {calc.title}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

"use client";

import katex from "katex";
import { useEffect, useMemo, useState } from "react";

import type { FormulaBlock } from "@/lib/formulas/types";
import { validateRequiredNumber } from "@/lib/validation";

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 1e6) / 1e6;
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 6,
  }).format(rounded);
}

function renderLatexToHtml(latex: string): string {
  const cleaned = String(latex)
    // zero-width chars that often appear in copy/paste
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // normalize whitespace/newlines
    .replace(/\s+/g, " ")
    .trim();
  return katex.renderToString(cleaned, {
    throwOnError: false,
    displayMode: true,
    strict: "ignore",
  });
}

export function FormulaBlockView({
  block,
  numberLabel,
}: {
  block: FormulaBlock;
  numberLabel?: string;
}) {
  const [raw, setRaw] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of block.params) initial[p.name] = "";
    return initial;
  });

  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof block.calculate> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);

  const { values, errors } = useMemo(() => {
    const nextErrors: Record<string, string> = {};
    const nextValues: Record<string, number> = {};

    for (const p of block.params) {
      const out = validateRequiredNumber(p.label, raw[p.name] ?? "", {
        min: p.min,
        max: p.max,
      });
      if (out.error) nextErrors[p.name] = out.error;
      else nextValues[p.name] = out.value as number;
    }

    return { values: nextValues, errors: nextErrors };
  }, [block.params, raw]);

  const canCalculate = Object.keys(errors).length === 0;

  const latexHtml = useMemo(() => renderLatexToHtml(block.latex), [block.latex]);

  function handleChange(name: string, value: string) {
    setRaw((prev) => ({ ...prev, [name]: value }));
    setTouched(true);
  }

  useEffect(() => {
    let cancelled = false;
    if (!canCalculate) {
      setResult(null);
      setComputeError(null);
      return;
    }

    async function run() {
      setLoading(true);
      setComputeError(null);
      try {
        const res = await fetch("/api/formulas/compute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: block.id,
            values,
          }),
        });
        const json = (await res.json().catch(() => null)) as
          | { ok: true; result: ReturnType<typeof block.calculate> }
          | { ok: false; error: string }
          | null;

        if (!cancelled) {
          if (!res.ok || !json || !json.ok) {
            setComputeError("Ошибка расчета");
            setResult(null);
          } else {
            setResult(json.result);
          }
        }
      } catch {
        if (!cancelled) {
          setComputeError("Ошибка расчета");
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(() => void run(), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [block.id, canCalculate, values]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        {numberLabel ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Формула {numberLabel}
          </div>
        ) : null}
        <div className="text-base font-semibold">{block.title}</div>
        {block.description ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {block.description}
          </div>
        ) : null}
      </div>

      <div
        className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        dangerouslySetInnerHTML={{ __html: latexHtml }}
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {block.params.map((p) => (
          <div key={p.name}>
            <label className="text-xs text-zinc-600 dark:text-zinc-400">
              {p.label}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                inputMode="decimal"
                value={raw[p.name] ?? ""}
                onChange={(e) => handleChange(p.name, e.target.value)}
                placeholder={p.placeholder}
                className={
                  "h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 dark:bg-zinc-950 " +
                  (touched && errors[p.name]
                    ? "border-red-300 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-800"
                    : "border-zinc-200 focus:ring-zinc-300 dark:border-zinc-800 dark:focus:ring-zinc-700")
                }
              />
              {p.unit ? (
                <span className="min-w-10 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.unit}
                </span>
              ) : null}
            </div>
            {touched && errors[p.name] ? (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors[p.name]}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold">Результат</div>
        {result ? (
          <div className="mt-2 grid gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Итог</div>
              <div className="mt-1 text-lg font-semibold">
                {result.result.label}: {formatNumber(result.result.value)}{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {result.result.unit ?? ""}
                </span>
              </div>
            </div>

            {result.steps.length > 0 ? (
              <div>
                <div className="text-sm font-semibold">Шаги</div>
                <ul className="mt-2 grid gap-2">
                  {result.steps.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {s.label}
                      </span>
                      <span className="font-medium">
                        {formatNumber(s.value)}{" "}
                        <span className="font-normal text-zinc-600 dark:text-zinc-400">
                          {s.unit ?? ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Введите параметры — результат посчитается автоматически.
          </div>
        )}
      </div>
    </section>
  );
}

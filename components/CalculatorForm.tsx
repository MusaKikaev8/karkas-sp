"use client";

import { useMemo, useState } from "react";
import type { CalculatorDefinition, CalcResult } from "@/lib/calculations/demo";
import { validateRequiredNumber } from "@/lib/validation";

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 1e6) / 1e6;
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 6,
  }).format(rounded);
}

export function CalculatorForm({
  calculator,
}: {
  calculator: CalculatorDefinition;
}) {
  const [raw, setRaw] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of calculator.fields) initial[field.name] = "";
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);

  const hasAnyInput = useMemo(
    () => Object.values(raw).some((v) => String(v).trim().length > 0),
    [raw]
  );

  function handleChange(name: string, value: string) {
    setRaw((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function handleCalculate() {
    const nextErrors: Record<string, string> = {};
    const values: Record<string, number> = {};

    for (const field of calculator.fields) {
      const out = validateRequiredNumber(field.label, raw[field.name] ?? "", {
        min: field.min,
      });
      if (out.error) nextErrors[field.name] = out.error;
      else values[field.name] = out.value as number;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
      return;
    }

    setResult(calculator.calculate(values));
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Ввод данных</h2>
            {calculator.description ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {calculator.description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Рассчитать
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {calculator.fields.map((field) => (
            <div key={field.name}>
              <label className="text-xs text-zinc-600 dark:text-zinc-400">
                {field.label}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  inputMode="decimal"
                  value={raw[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={
                    "h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 dark:bg-zinc-950 " +
                    (errors[field.name]
                      ? "border-red-300 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-800"
                      : "border-zinc-200 focus:ring-zinc-300 dark:border-zinc-800 dark:focus:ring-zinc-700")
                  }
                />
                {field.unit ? (
                  <span className="min-w-10 text-sm text-zinc-600 dark:text-zinc-400">
                    {field.unit}
                  </span>
                ) : null}
              </div>
              {errors[field.name] ? (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors[field.name]}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {!result && hasAnyInput && Object.keys(errors).length > 0 ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            Исправьте ошибки и повторите расчёт.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Результаты</h2>
        {result ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Итог
              </div>
              <div className="mt-1 text-lg font-semibold">
                {result.result.label}: {formatNumber(result.result.value)}{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {result.result.unit ?? ""}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Промежуточные величины</div>
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
          </div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Заполните поля и нажмите «Рассчитать».
          </div>
        )}
      </section>
    </div>
  );
}

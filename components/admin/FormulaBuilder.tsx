"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ParamEditor } from "./ParamEditor";
import type { FormulaParam } from "@/lib/formulas/types";
import type { CustomFormulaRecord } from "@/lib/formulas/custom";

interface FormulaBuilderProps {
  spCode: string;
  onFormulaSaved?: (formula: CustomFormulaRecord) => void;
  onCancel?: () => void;
  initialFormula?: CustomFormulaRecord;
}

type TestResult = {
  result?: number;
  error?: string;
};

export function FormulaBuilder({
  spCode,
  onFormulaSaved,
  onCancel,
  initialFormula,
}: FormulaBuilderProps) {
  const [title, setTitle] = useState(initialFormula?.title || "");
  const [description, setDescription] = useState(
    initialFormula?.description || ""
  );
  const [latex, setLatex] = useState(initialFormula?.latex || "");
  const [params, setParams] = useState<FormulaParam[]>(
    initialFormula?.params || []
  );
  const [expression, setExpression] = useState(
    initialFormula?.expression || ""
  );
  const [resultLabel, setResultLabel] = useState(
    initialFormula?.result_label || "Результат"
  );
  const [resultUnit, setResultUnit] = useState(
    initialFormula?.result_unit || ""
  );

  const [testValues, setTestValues] = useState<Record<string, number | undefined>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize test values
  useEffect(() => {
    const newTestValues: Record<string, number> = {};
    params.forEach((param) => {
      newTestValues[param.name] = param.min ?? 1;
    });
    setTestValues(newTestValues);
  }, [params]);

  const testValuesComplete = useMemo(() => {
    return params.every((p) => testValues[p.name] !== undefined);
  }, [params, testValues]);

  const handleTest = useCallback(async () => {
    if (!testValuesComplete) {
      setError("Заполните все параметры для теста");
      return;
    }

    setError(null);
    setTesting(true);
    try {
      const res = await fetch("/api/custom-formulas/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expression,
          values: testValues,
        }),
      });

      const json = (await res.json()) as TestResult;

      if (!res.ok) {
        setTestResult({ error: json.error });
        return;
      }

      setTestResult({ result: json.result });
    } catch (err) {
      setTestResult({ error: String(err) });
    } finally {
      setTesting(false);
    }
  }, [expression, testValues, testValuesComplete]);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Укажите название формулы");
      return;
    }

    if (!latex.trim()) {
      setError("Укажите LaTeX представление формулы");
      return;
    }

    if (!expression.trim()) {
      setError("Укажите выражение для расчёта");
      return;
    }

    if (params.length === 0) {
      setError("Добавьте хотя бы один параметр");
      return;
    }

    setSaving(true);
    try {
      const method = initialFormula ? "PUT" : "POST";
      const endpoint = initialFormula
        ? `/api/custom-formulas?id=${initialFormula.id}`
        : `/api/custom-formulas?spCode=${encodeURIComponent(spCode)}`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          latex: latex.trim(),
          params,
          expression: expression.trim(),
          result_label: resultLabel.trim(),
          result_unit: resultUnit.trim() || undefined,
        }),
      });

      const json = (await res.json()) as any;

      if (!res.ok) {
        setError(json.error || "Ошибка сохранения");
        return;
      }

      onFormulaSaved?.(json.formula);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
      <div className="mb-4 text-sm font-semibold">
        {initialFormula ? "Редактировать формулу" : "Создать новую формулу"}
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название формулы"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (опционально)"
            rows={2}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
        </div>

        {/* LaTeX */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            LaTeX формула
          </label>
          <textarea
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder={String.raw`Например: \sigma = \dfrac{N}{A}`}
            rows={2}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
        </div>

        {/* Parameters */}
        <ParamEditor params={params} onParamsChange={setParams} />

        {/* Expression */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Выражение расчёта (JavaScript)
          </label>
          <textarea
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Например: values.N / values.A или Math.sqrt(values.x * values.y)"
            rows={3}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Доступны переменные: {params.map((p) => `values.${p.name}`).join(", ") || "нет"}, функции Math
          </div>
        </div>

        {/* Result Configuration */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Название результата
            </label>
            <input
              type="text"
              value={resultLabel}
              onChange={(e) => setResultLabel(e.target.value)}
              placeholder="Результат"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Единица результата (опционально)
            </label>
            <input
              type="text"
              value={resultUnit}
              onChange={(e) => setResultUnit(e.target.value)}
              placeholder="Например: МПа, мм, кВт"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
            />
          </div>
        </div>

        {/* Test Section */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
          <div className="mb-2 text-xs font-semibold text-blue-900 dark:text-blue-100">
            Тест формулы
          </div>
          <div className="space-y-2">
            {params.map((param) => (
              <div key={param.name} className="flex items-center gap-2">
                <label className="min-w-24 text-xs text-blue-800 dark:text-blue-200">
                  {param.label}
                  {param.unit && ` (${param.unit})`}
                </label>
                <input
                  type="number"
                  value={testValues[param.name] ?? ""}
                  onChange={(e) => {
                    const newValues = { ...testValues };
                    if (e.target.value) {
                      newValues[param.name] = Number(e.target.value);
                    } else {
                      delete newValues[param.name];
                    }
                    setTestValues(newValues);
                  }}
                  min={param.min}
                  max={param.max}
                  step="any"
                  className="h-7 w-24 rounded border border-blue-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-50"
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={!testValuesComplete || testing}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? "Тестирование..." : "Протестировать"}
              </button>
            </div>

            {testResult && (
              <div
                className={`rounded border px-2 py-1.5 text-xs ${
                  testResult.error
                    ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                    : "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                }`}
              >
                {testResult.error ? (
                  <>Ошибка: {testResult.error}</>
                ) : (
                  <>
                    Результат: <span className="font-semibold">{testResult.result}</span>{" "}
                    {resultUnit}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving
              ? initialFormula
                ? "Сохранение..."
                : "Создание..."
              : initialFormula
              ? "Сохранить"
              : "Создать формулу"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Отменить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

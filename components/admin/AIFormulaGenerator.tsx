"use client";

import { useState } from "react";
import type { FormulaParam } from "@/lib/formulas/types";

interface AIFormulaGeneratorProps {
  spCode: string;
  onFormulaGenerated?: (formula: any) => void;
}

type GeneratedFormula = {
  title: string;
  description?: string;
  latex: string;
  params: FormulaParam[];
  expression: string;
  result_label: string;
  result_unit?: string;
};

export function AIFormulaGenerator({ spCode, onFormulaGenerated }: AIFormulaGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFormula, setGeneratedFormula] = useState<GeneratedFormula | null>(null);
  const [saving, setSaving] = useState(false);

  const examples = [
    "Создай формулу для расчёта площади круга по радиусу",
    "Формула момента инерции прямоугольного сечения",
    "Расчёт касательного напряжения при сдвиге",
    "Вычисление модуля упругости при изгибе",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Напишите запрос");
      return;
    }

    setError(null);
    setGenerating(true);
    setGeneratedFormula(null);

    try {
      const res = await fetch("/api/custom-formulas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка генерации");
        return;
      }

      setGeneratedFormula(json.formula);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedFormula) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/custom-formulas?spCode=${encodeURIComponent(spCode)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedFormula),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка сохранения");
        return;
      }

      onFormulaGenerated?.(json.formula);
      setPrompt("");
      setGeneratedFormula(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-900 dark:from-blue-950 dark:to-indigo-950">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-2xl">🤖</div>
        <div>
          <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            AI-генератор формул
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Опишите формулу на русском языке, ИИ создаст её автоматически
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-900 dark:text-blue-100">
            Опишите формулу:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Например: Создай формулу для расчёта площади прямоугольника. Параметры: ширина b и высота h в миллиметрах"
            rows={4}
            className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-50"
            disabled={generating}
          />
        </div>

        {/* Examples */}
        <div>
          <div className="mb-2 text-xs font-medium text-blue-700 dark:text-blue-300">
            Примеры запросов:
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                disabled={generating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {generating ? "🤖 Генерирую формулу..." : "✨ Сгенерировать формулу"}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            ❌ {error}
          </div>
        )}

        {/* Generated Formula Preview */}
        {generatedFormula && (
          <div className="space-y-3 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <div className="text-xl">✅</div>
              <div className="font-semibold text-green-900 dark:text-green-100">
                Формула сгенерирована
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-white p-3 text-sm dark:bg-green-900">
              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  Название:
                </span>{" "}
                <span className="text-green-700 dark:text-green-200">
                  {generatedFormula.title}
                </span>
              </div>

              {generatedFormula.description && (
                <div>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Описание:
                  </span>{" "}
                  <span className="text-green-700 dark:text-green-200">
                    {generatedFormula.description}
                  </span>
                </div>
              )}

              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  LaTeX:
                </span>{" "}
                <code className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-800 dark:text-green-100">
                  {generatedFormula.latex}
                </code>
              </div>

              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  Параметры:
                </span>
                <div className="mt-1 space-y-1">
                  {generatedFormula.params.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-green-700 dark:text-green-200"
                    >
                      • {p.label} ({p.name})
                      {p.unit && ` — ${p.unit}`}
                      {p.min !== undefined && ` | min: ${p.min}`}
                      {p.max !== undefined && ` | max: ${p.max}`}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  Выражение:
                </span>{" "}
                <code className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-800 dark:text-green-100">
                  {generatedFormula.expression}
                </code>
              </div>

              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  Результат:
                </span>{" "}
                <span className="text-green-700 dark:text-green-200">
                  {generatedFormula.result_label}
                  {generatedFormula.result_unit && ` (${generatedFormula.result_unit})`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить формулу"}
              </button>
              <button
                type="button"
                onClick={() => setGeneratedFormula(null)}
                className="rounded-lg border border-green-300 px-4 py-2 font-medium hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
              >
                Отменить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { SpTableColumn, CellMeta } from "@/app/api/sp-tables/route";

interface AITableGeneratorProps {
  spCode: string;
  clauseId: string;
  onTableGenerated?: (table: any) => void;
}

type GeneratedTable = {
  title: string;
  description?: string;
  notes?: string;
  columns: SpTableColumn[];
  rows: (string | number)[][];
  cell_meta?: Record<string, CellMeta>;
};

export function AITableGenerator({ spCode, clauseId, onTableGenerated }: AITableGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTable, setGeneratedTable] = useState<GeneratedTable | null>(null);
  const [saving, setSaving] = useState(false);

  const examples = [
    "Создай таблицу коэффициентов снеговой нагрузки для разных регионов России",
    "Таблица несущей способности бетона разных марок",
    "Предельные прогибы для различных типов конструкций",
    "Коэффициенты условий работы для стали при разных температурах",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Напишите запрос");
      return;
    }

    setError(null);
    setGenerating(true);
    setGeneratedTable(null);

    try {
      const res = await fetch("/api/sp-tables/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          spCode,
          clauseId
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка генерации");
        return;
      }

      setGeneratedTable(json.table);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTable) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/sp-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sp_code: spCode,
          clause_id: clauseId,
          ...generatedTable,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка сохранения");
        return;
      }

      onTableGenerated?.(json.table);
      setPrompt("");
      setGeneratedTable(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-900 dark:from-purple-950 dark:to-pink-950">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-2xl">🤖</div>
        <div>
          <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            AI-генератор таблиц
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            Опишите таблицу на русском языке, ИИ создаст её автоматически
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-purple-900 dark:text-purple-100">
            Опишите таблицу:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Например: Создай таблицу коэффициентов надежности для разных типов нагрузок. Колонки: тип нагрузки, постоянная, временная, особая. Добавь примечание о применении"
            rows={4}
            className="w-full rounded-lg border border-purple-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-50"
            disabled={generating}
          />
        </div>

        {/* Examples */}
        <div>
          <div className="mb-2 text-xs font-medium text-purple-700 dark:text-purple-300">
            Примеры запросов:
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full bg-white px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700"
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
          className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          {generating ? "🤖 Генерирую таблицу..." : "✨ Сгенерировать таблицу"}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            ❌ {error}
          </div>
        )}

        {/* Generated Table Preview */}
        {generatedTable && (
          <div className="space-y-3 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <div className="text-xl">✅</div>
              <div className="font-semibold text-green-900 dark:text-green-100">
                Таблица сгенерирована
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-white p-4 text-sm dark:bg-green-900">
              <div>
                <span className="font-medium text-green-900 dark:text-green-100">
                  Название:
                </span>{" "}
                <span className="text-green-700 dark:text-green-200">
                  {generatedTable.title}
                </span>
              </div>

              {generatedTable.description && (
                <div>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Описание:
                  </span>{" "}
                  <span className="text-green-700 dark:text-green-200">
                    {generatedTable.description}
                  </span>
                </div>
              )}

              {/* Table Preview */}
              <div className="overflow-x-auto rounded-lg border border-green-200 dark:border-green-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-green-100 dark:bg-green-800">
                      {generatedTable.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-1 text-left font-medium text-green-900 dark:text-green-100"
                        >
                          {col.label}
                          {col.unit && (
                            <span className="ml-1 text-xs text-green-600 dark:text-green-300">
                              ({col.unit})
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedTable.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-t border-green-200 dark:border-green-700"
                      >
                        {row.map((cell, cellIdx) => {
                          const cellKey = `${rowIdx},${cellIdx}`;
                          const meta = generatedTable.cell_meta?.[cellKey];
                          
                          if (meta?.hidden) return null;

                          return (
                            <td
                              key={cellIdx}
                              rowSpan={meta?.rowspan}
                              colSpan={meta?.colspan}
                              className="px-2 py-1 text-green-700 dark:text-green-200"
                            >
                              {typeof cell === "number" ? cell.toLocaleString("ru-RU") : cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {generatedTable.notes && (
                <div>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Примечания:
                  </span>
                  <div className="mt-1 rounded bg-green-100 p-2 text-xs text-green-700 dark:bg-green-800 dark:text-green-200">
                    {generatedTable.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить таблицу"}
              </button>
              <button
                type="button"
                onClick={() => setGeneratedTable(null)}
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

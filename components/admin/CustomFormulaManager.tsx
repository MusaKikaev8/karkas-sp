"use client";

import { useEffect, useState } from "react";
import { FormulaBuilder } from "./FormulaBuilder";
import { AIFormulaGenerator } from "./AIFormulaGenerator";
import type { CustomFormulaRecord } from "@/lib/formulas/custom";

interface CustomFormulaManagerProps {
  spCode: string;
}

export function CustomFormulaManager({ spCode }: CustomFormulaManagerProps) {
  const [formulas, setFormulas] = useState<CustomFormulaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingFormula, setEditingFormula] = useState<CustomFormulaRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  useEffect(() => {
    loadFormulas();
  }, [spCode]);

  async function loadFormulas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/custom-formulas?spCode=${encodeURIComponent(spCode)}`
      );
      const json = (await res.json()) as any;
      setFormulas(json.ok ? json.formulas : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Вы уверены?")) return;

    try {
      const res = await fetch(`/api/custom-formulas?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Ошибка удаления");
        return;
      }

      await loadFormulas();
    } catch (err) {
      setError(String(err));
    }
  }

  const handleFormulaSaved = async () => {
    setShowBuilder(false);
    setEditingFormula(null);
    setMode("ai");
    await loadFormulas();
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("ai");
            setShowBuilder(false);
            setEditingFormula(null);
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            mode === "ai"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          AI-генератор
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setShowBuilder(true);
            setEditingFormula(null);
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            mode === "manual"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Ручной конструктор
        </button>
      </div>

      {mode === "ai" && (
        <AIFormulaGenerator
          spCode={spCode}
          onFormulaGenerated={async () => {
            await loadFormulas();
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Кастомные формулы</div>
        {!showBuilder && !editingFormula && (
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Новая формула
          </button>
        )}
      </div>

      {/* Builder */}
      {(showBuilder || editingFormula) && (
        <FormulaBuilder
          spCode={spCode}
          initialFormula={editingFormula || undefined}
          onFormulaSaved={handleFormulaSaved}
          onCancel={() => {
            setShowBuilder(false);
            setEditingFormula(null);
            setMode("ai");
          }}
        />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка...</div>
        ) : formulas.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Кастомные формулы не добавлены
          </div>
        ) : (
          <div className="space-y-2">
            {formulas.map((formula) => (
              <div
                key={formula.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {formula.title}
                  </div>
                  {formula.description && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formula.description}
                    </div>
                  )}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formula.params.length} параметров • Создано:{" "}
                    {new Date(formula.created_at).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingFormula(formula)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(formula.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

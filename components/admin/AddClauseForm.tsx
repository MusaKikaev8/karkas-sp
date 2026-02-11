"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { normalizeSpCode } from "@/lib/utils/sp-code";

type ParentClause = {
  clause_id: string;
  title: string;
};

export function AddClauseForm({
  spCode,
  parentClauses,
}: {
  spCode: string;
  parentClauses: ParentClause[];
}) {
  const [mode, setMode] = useState<"clause" | "subclause">("clause");
  const [parentClauseId, setParentClauseId] = useState("");
  const [formData, setFormData] = useState({
    clauseId: "",
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setFormData({ clauseId: "", title: "" });
    setParentClauseId("");
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (mode === "subclause" && !parentClauseId) {
        setError("Выберите родительский пункт.");
        return;
      }

      const normalizedCode = normalizeSpCode(spCode);
      const endpoint =
        mode === "clause"
          ? `/api/sp/${encodeURIComponent(normalizedCode)}/clauses`
          : `/api/sp/${encodeURIComponent(normalizedCode)}/subclauses`;

      const payload =
        mode === "clause"
          ? {
              clause_id: formData.clauseId,
              title: formData.title,
            }
          : {
              parent_clause_id: parentClauseId,
              subclause_id: formData.clauseId,
              title: formData.title,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Ошибка при создании пункта");
      }

      setSuccess(true);
      resetForm();
      // Перезагрузить страницу чтобы обновить список пунктов
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании пункта");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-400 text-sm">
          {mode === "clause" ? "Пункт" : "Подпункт"} успешно добавлен!
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Тип записи
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "clause" | "subclause")}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="clause">Пункт</option>
            <option value="subclause">Подпункт</option>
          </select>
        </div>
        {mode === "subclause" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Родительский пункт
            </label>
            <select
              value={parentClauseId}
              onChange={(e) => setParentClauseId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите пункт</option>
              {parentClauses.map((c) => (
                <option key={c.clause_id} value={c.clause_id}>
                  {c.clause_id} — {c.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Номер {mode === "clause" ? "пункта" : "подпункта"} *
          </label>
          <input
            type="text"
            required
            placeholder={mode === "clause" ? "5" : "5.2"}
            value={formData.clauseId}
            onChange={(e) =>
              setFormData({ ...formData, clauseId: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Название *
          </label>
          <input
            type="text"
            required
            placeholder="Упрощённые оценочные расчёты"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить пункт"}
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Очистить
        </Button>
      </div>
    </form>
  );
}

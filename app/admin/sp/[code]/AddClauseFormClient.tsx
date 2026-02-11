"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type AddClauseFormClientProps = {
  spCode: string;
};

export function AddClauseFormClient({ spCode }: AddClauseFormClientProps) {
  const [clauseId, setClauseId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/sp/${spCode}/clauses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clause_id: clauseId,
          title,
          summary: summary || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при добавлении пункта");
        return;
      }

      setSuccess(true);
      setClauseId("");
      setTitle("");
      setSummary("");

      // Reload page after 500ms
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
          Пункт добавлен! Страница обновляется...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Номер пункта *
          </label>
          <input
            type="text"
            value={clauseId}
            onChange={(e) => setClauseId(e.target.value)}
            placeholder="1.2.3"
            required
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Название *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название пункта"
            required
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Описание
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Краткое описание пункта (опционально)"
          disabled={loading}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => {
            setClauseId("");
            setTitle("");
            setSummary("");
            setError(null);
          }}
        >
          Очистить
        </Button>
        <Button type="submit" disabled={loading || !clauseId || !title}>
          {loading ? "Добавление..." : "Добавить пункт"}
        </Button>
      </div>
    </form>
  );
}

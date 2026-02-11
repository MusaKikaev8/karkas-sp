"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { normalizeSpCode } from "@/lib/supabase/helpers";

export default function NewClausePage({ params }: { params: Promise<{ code: string }> }) {
  let { code } = use(params);
  code = decodeURIComponent(code);
  code = normalizeSpCode(code);
  const router = useRouter();
  const [mode, setMode] = useState<"clause" | "subclause">("clause");
  const [parentClauseId, setParentClauseId] = useState("");
  const [parentClauses, setParentClauses] = useState<{ clause_id: string; title: string }[]>([]);
  const [formData, setFormData] = useState({
    clauseId: "",
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadParentClauses() {
      try {
        const res = await fetch(`/api/sp/${encodeURIComponent(code)}/clauses`);
        const data = (await res.json()) as { clause_id: string; title: string }[];
        if (!cancelled && Array.isArray(data)) {
          setParentClauses(data.map((row) => ({ clause_id: row.clause_id, title: row.title })));
        }
      } catch {
        if (!cancelled) setParentClauses([]);
      }
    }
    void loadParentClauses();
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "subclause" && !parentClauseId) {
        setError("Выберите родительский пункт.");
        return;
      }

      const endpoint =
        mode === "clause"
          ? `/api/sp/${encodeURIComponent(code)}/clauses`
          : `/api/sp/${encodeURIComponent(code)}/subclauses`;

      const payload =
        mode === "clause"
          ? { clause_id: formData.clauseId, title: formData.title }
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

      router.push(`/admin/sp/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании пункта");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <Link
          href={`/admin/sp/${code}`}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 inline-block"
        >
          ← Назад
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Новый пункт СП</h1>
      </header>

      <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 text-sm">
              {error}
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

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Добавить пункт"}
            </Button>
            <Link href={`/admin/sp/${code}`}>
              <Button variant="outline" type="button">
                Отмена
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

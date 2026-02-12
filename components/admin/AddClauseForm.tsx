"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { normalizeSpCode } from "@/lib/utils/sp-code";

type TreeNode = {
  id: string;
  clause_id: string;
  title: string;
  children?: TreeNode[];
};

export function AddClauseForm({ spCode }: { spCode: string }) {
  const [clauses, setClauses] = useState<TreeNode[]>([]);
  const [parentId, setParentId] = useState<string>("");
  const [formData, setFormData] = useState({
    clauseId: "",
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadClauses();
  }, []);

  async function loadClauses() {
    try {
      const response = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/clauses-tree`
      );
      if (!response.ok) throw new Error("Не удалось загрузить пункты");
      const tree = await response.json();
      setClauses(tree);
    } catch (err) {
      console.error("Error loading clauses:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({ clauseId: "", title: "" });
    setParentId("");
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!formData.clauseId || !formData.title) {
        setError("Заполните все поля");
        setIsSubmitting(false);
        return;
      }

      const normalizedCode = normalizeSpCode(spCode);
      const response = await fetch(
        `/api/sp/${encodeURIComponent(normalizedCode)}/clauses-tree`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clause_id: formData.clauseId,
            title: formData.title,
            parent_id: parentId || null,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Ошибка при создании пункта");
      }

      setSuccess(true);
      resetForm();
      loadClauses();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании пункта");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Flatten tree for select options
  function flattenTree(nodes: TreeNode[], level = 0): { id: string; label: string }[] {
    let result: { id: string; label: string }[] = [];
    for (const node of nodes) {
      result.push({
        id: node.id,
        label: "  ".repeat(level) + node.clause_id + " — " + node.title,
      });
      if (node.children) {
        result.push(...flattenTree(node.children, level + 1));
      }
    }
    return result;
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
          Пункт успешно добавлен!
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка пунктов...</div>
      ) : (
        <div className="space-y-4">
          {clauses.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Родительский пункт (опционально)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Создать корневой пункт —</option>
                {flattenTree(clauses).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Номер пункта *
              </label>
              <input
                type="text"
                required
                placeholder="5 или 5.2 или 5.2.1"
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
                placeholder="Название пункта"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Добавляю..." : "Добавить пункт"}
      </Button>
    </form>
  );
}

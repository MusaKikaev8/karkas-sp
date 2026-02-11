"use client";

import { useEffect, useMemo, useState } from "react";
import { FORMULA_REGISTRY } from "@/lib/formulas/registry";

type FormulaBlockOption = {
  id: string;
  title: string;
};

type FormulaItem = {
  id: string;
  block_id: string;
  formula_number: string;
  title: string | null;
};

export function FormulaManager({
  spCode,
  clauseId,
}: {
  spCode: string;
  clauseId: string;
}) {
  const [items, setItems] = useState<FormulaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formulaNumber, setFormulaNumber] = useState("");
  const [blockId, setBlockId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocks: FormulaBlockOption[] = useMemo(() => {
    return Object.values(FORMULA_REGISTRY).map((block) => ({
      id: block.id,
      title: block.title,
    }));
  }, []);

  useEffect(() => {
    loadFormulas();
  }, [spCode, clauseId]);

  async function loadFormulas() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ clauseId });
      const res = await fetch(`/api/sp/${encodeURIComponent(spCode)}/formulas?${qs.toString()}`);
      const json = (await res.json().catch(() => null)) as
        | { ok: boolean; formulas: FormulaItem[] }
        | null;
      setItems(json?.ok ? json.formulas : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const blockLabel = useMemo(() => {
    const block = blocks.find((b) => b.id === blockId);
    return block?.title || "";
  }, [blocks, blockId]);

  async function handleAdd() {
    setError(null);
    if (!formulaNumber.trim() || !blockId) {
      setError("Укажите номер формулы и выберите блок.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/formulas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clause_id: clauseId,
            block_id: blockId,
            formula_number: formulaNumber.trim(),
            title: customTitle.trim(),
          }),
        }
      );
      const json = (await res.json().catch(() => null)) as
        | { error: string }
        | null;
      if (!res.ok) {
        setError(json?.error || "Ошибка сохранения");
        return;
      }
      setFormulaNumber("");
      setBlockId("");
      setCustomTitle("");
      await loadFormulas();
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/formulas?id=${encodeURIComponent(
          id
        )}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("Ошибка удаления");
        return;
      }
      await loadFormulas();
    } catch {
      setError("Ошибка удаления");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
      <div className="text-sm font-semibold">Формулы пункта</div>

      <div className="mt-3 grid gap-3">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Формулы не добавлены.
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((f) => {
              const block = blocks.find((b) => b.id === f.block_id);
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="text-xs text-zinc-500">{f.formula_number}</div>
                    <div className="font-medium">
                      {f.title || block?.title || f.block_id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={formulaNumber}
            onChange={(e) => setFormulaNumber(e.target.value)}
            placeholder="Номер (например 5.2-1)"
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          >
            <option value="">Выберите блок</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={blockLabel ? `Заголовок (по умолчанию: ${blockLabel})` : "Заголовок"}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
          />
        </div>

        {error ? (
          <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
        ) : null}

        <button
          type="button"
          disabled={saving}
          onClick={handleAdd}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {saving ? "Сохранение..." : "Добавить формулу"}
        </button>
      </div>
    </div>
  );
}

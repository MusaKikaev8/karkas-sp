"use client";

import { useEffect, useState } from "react";
import { TableEditor } from "./TableEditor";
import { AITableGenerator } from "./AITableGenerator";
import type { SpTableRecord } from "@/app/api/sp-tables/route";

interface TableManagerProps {
  spCode: string;
  clauseId: string;
}

export function TableManager({ spCode, clauseId }: TableManagerProps) {
  const [tables, setTables] = useState<SpTableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingTable, setEditingTable] = useState<SpTableRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, [spCode, clauseId]);

  async function loadTables() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sp-tables?spCode=${encodeURIComponent(spCode)}&clauseId=${encodeURIComponent(clauseId)}`
      );
      const json = (await res.json()) as any;
      setTables(json.ok ? json.tables : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Вы уверены?")) return;

    try {
      const res = await fetch(`/api/sp-tables?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Ошибка удаления");
        return;
      }

      await loadTables();
    } catch (err) {
      setError(String(err));
    }
  }

  const handleSaved = async () => {
    setShowEditor(false);
    setEditingTable(null);
    await loadTables();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Нормативные таблицы</div>
        {!showEditor && !editingTable && (
          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Новая таблица
          </button>
        )}
      </div>

      {/* Editor */}
      {(showEditor || editingTable) && (
        <TableEditor
          spCode={spCode}
          clauseId={clauseId}
          initialTable={editingTable || undefined}
          onSave={handleSaved}
          onCancel={() => {
            setShowEditor(false);
            setEditingTable(null);
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
        ) : tables.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Таблицы не добавлены
          </div>
        ) : (
          <div className="space-y-2">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {table.title}
                  </div>
                  {table.description && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {table.description}
                    </div>
                  )}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {table.columns.length} колонок • {table.rows.length} строк • Создано:{" "}
                    {new Date(table.created_at).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingTable(table)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(table.id)}
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

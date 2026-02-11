"use client";

import { useEffect, useState } from "react";
import type { SpTableRecord } from "@/app/api/sp-tables/route";

interface SpTableViewProps {
  spCode: string;
  clauseId: string;
}

export function SpTableView({ spCode, clauseId }: SpTableViewProps) {
  const [tables, setTables] = useState<SpTableRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTables();
  }, [spCode, clauseId]);

  async function loadTables() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sp-tables?spCode=${encodeURIComponent(spCode)}&clauseId=${encodeURIComponent(clauseId)}`
      );
      const json = (await res.json()) as any;
      setTables(json.ok ? json.tables : []);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
        Загрузка таблиц...
      </div>
    );
  }

  if (tables.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Table Header */}
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800">
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              {table.title}
            </div>
            {table.description && (
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {table.description}
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  {table.columns.map((col, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {col.label}
                      {col.unit && (
                        <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                          ({col.unit})
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                  >
                    {row.map((cell, cellIndex) => {
                      const cellKey = `${rowIndex},${cellIndex}`;
                      const meta = table.cell_meta?.[cellKey];

                      // Skip hidden cells (covered by merged cells)
                      if (meta?.hidden) {
                        return null;
                      }

                      return (
                        <td
                          key={cellIndex}
                          rowSpan={meta?.rowspan}
                          colSpan={meta?.colspan}
                          className="px-4 py-2 text-zinc-900 dark:text-zinc-100"
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

          {/* Table Notes */}
          {table.notes && (
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Примечания:
              </div>
              <div className="prose prose-sm max-w-none text-zinc-600 dark:text-zinc-400">
                {table.notes.split('\n').map((line, idx) => (
                  <p key={idx} className="text-xs leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { FormulaParam } from "@/lib/formulas/types";

interface ParamEditorProps {
  params: FormulaParam[];
  onParamsChange: (params: FormulaParam[]) => void;
}

export function ParamEditor({ params, onParamsChange }: ParamEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingParam, setEditingParam] = useState<FormulaParam | null>(null);

  const handleAddParam = () => {
    const newParam: FormulaParam = {
      name: `param_${Date.now()}`,
      label: "Новый параметр",
    };
    onParamsChange([...params, newParam]);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingParam({ ...params[index] });
  };

  const handleEditSave = () => {
    if (editingIndex !== null && editingParam) {
      const updated = [...params];
      updated[editingIndex] = editingParam;
      onParamsChange(updated);
      setEditingIndex(null);
      setEditingParam(null);
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingParam(null);
  };

  const handleDelete = (index: number) => {
    onParamsChange(params.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Параметры</div>
        <button
          type="button"
          onClick={handleAddParam}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
        >
          + Параметр
        </button>
      </div>

      <div className="space-y-2">
        {params.length === 0 ? (
          <div className="text-xs text-zinc-500">Нет параметров</div>
        ) : (
          params.map((param, index) => (
            <div
              key={param.name}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-800"
            >
              {editingIndex === index && editingParam ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editingParam.name}
                    onChange={(e) =>
                      setEditingParam({
                        ...editingParam,
                        name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"),
                      })
                    }
                    placeholder="Имя параметра (name)"
                    className="h-7 w-full rounded border border-zinc-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                  <input
                    type="text"
                    value={editingParam.label}
                    onChange={(e) =>
                      setEditingParam({
                        ...editingParam,
                        label: e.target.value,
                      })
                    }
                    placeholder="Отображаемое имя (label)"
                    className="h-7 w-full rounded border border-zinc-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editingParam.unit || ""}
                      onChange={(e) =>
                        setEditingParam({
                          ...editingParam,
                          unit: e.target.value || undefined,
                        })
                      }
                      placeholder="Единица"
                      className="h-7 rounded border border-zinc-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                    <input
                      type="number"
                      value={editingParam.min ?? ""}
                      onChange={(e) =>
                        setEditingParam({
                          ...editingParam,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Min"
                      className="h-7 rounded border border-zinc-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                    <input
                      type="number"
                      value={editingParam.max ?? ""}
                      onChange={(e) =>
                        setEditingParam({
                          ...editingParam,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max"
                      className="h-7 rounded border border-zinc-300 bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEditSave}
                      className="flex-1 rounded bg-green-600 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="flex-1 rounded bg-zinc-400 py-1 text-xs font-medium text-white hover:bg-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
                      {param.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {param.name}
                      {param.unit && ` • ${param.unit}`}
                      {param.min !== undefined && ` • min: ${param.min}`}
                      {param.max !== undefined && ` • max: ${param.max}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditStart(index)}
                      className="rounded bg-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    >
                      Изм.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                    >
                      Удал.
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

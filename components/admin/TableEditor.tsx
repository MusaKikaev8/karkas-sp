"use client";

import { useState, useEffect } from "react";
import { ExcelImporter } from "./ExcelImporter";
import type { SpTableColumn, SpTableRecord, CellMeta } from "@/app/api/sp-tables/route";

interface TableEditorProps {
  spCode: string;
  clauseId: string;
  initialTable?: SpTableRecord;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TableEditor({
  spCode,
  clauseId,
  initialTable,
  onSave,
  onCancel,
}: TableEditorProps) {
  const [title, setTitle] = useState(initialTable?.title || "");
  const [description, setDescription] = useState(initialTable?.description || "");
  const [notes, setNotes] = useState(initialTable?.notes || "");
  const [columns, setColumns] = useState<SpTableColumn[]>(
    initialTable?.columns || [{ name: "col1", label: "Колонка 1", type: "text" }]
  );
  const [rows, setRows] = useState<(string | number)[][]>(
    initialTable?.rows || [[""]]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExcelImporter, setShowExcelImporter] = useState(false);
  const [cellMeta, setCellMeta] = useState<Record<string, CellMeta>>(
    initialTable?.cell_meta || {}
  );

  // Sync rows with columns when columns change
  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = [...row];
        // Add empty values for new columns
        while (newRow.length < columns.length) {
          newRow.push("");
        }
        // Remove extra values if columns were deleted
        return newRow.slice(0, columns.length);
      })
    );
  }, [columns.length]);

  const handleAddColumn = () => {
    const newColIndex = columns.length + 1;
    setColumns([
      ...columns,
      { name: `col${newColIndex}`, label: `Колонка ${newColIndex}`, type: "text" },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length === 1) {
      setError("Должна быть хотя бы одна колонка");
      return;
    }
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleUpdateColumn = (
    index: number,
    field: keyof SpTableColumn,
    value: string
  ) => {
    const newColumns = [...columns];
    (newColumns[index][field] as any) = value;
    setColumns(newColumns);
  };

  const handleAddRow = () => {
    setRows([...rows, Array(columns.length).fill("")]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) {
      setError("Должна быть хотя бы одна строка");
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    const column = columns[colIndex];
    
    // Convert to number if column type is number
    if (column.type === "number") {
      newRows[rowIndex][colIndex] = value === "" ? "" : Number(value);
    } else {
      newRows[rowIndex][colIndex] = value;
    }
    
    setRows(newRows);
  };

  const handleExcelImport = (data: {
    columns: SpTableColumn[];
    rows: (string | number)[][];
    title?: string;
  }) => {
    setColumns(data.columns);
    setRows(data.rows);
    if (data.title && !title) {
      setTitle(data.title);
    }
    setShowExcelImporter(false);
  };

  const handleSave = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Введите название таблицы");
      return;
    }

    if (columns.length === 0) {
      setError("Добавьте хотя бы одну колонку");
      return;
    }

    if (rows.length === 0) {
      setError("Добавьте хотя бы одну строку");
      return;
    }

    setSaving(true);

    try {
      const method = initialTable ? "PUT" : "POST";
      const endpoint = initialTable
        ? `/api/sp-tables?id=${initialTable.id}`
        : `/api/sp-tables`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sp_code: spCode,
          clause_id: clauseId,
          title: title.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          columns,
          rows,
          cell_meta: cellMeta,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка сохранения");
        return;
      }

      onSave?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-sm font-semibold">
        {initialTable ? "Редактировать таблицу" : "Новая таблица"}
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Название таблицы
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Таблица 5.1. Коэффициенты надёжности..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Описание (опционально)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Дополнительные пояснения к таблице..."
          rows={2}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Примечания (опционально)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Примечания к таблице (markdown поддерживается)..."
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Cell Merge Settings */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Объединение строк/столбцов (JSON) - опционально
        </label>
        <div className="mb-2 rounded bg-zinc-100 p-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          Формат: {"{"}
          &quot;row,col&quot;: {"{"}rowspan: 2, colspan: 2{"}"}, ...{"}"}
          <br/>
          Пример: {"{"}
          &quot;0,1&quot;: {"{"}colspan: 2{"}"}, &quot;1,0&quot;: {"{"}rowspan: 2{"}"}
          {"}"}
        </div>
        <textarea
          value={JSON.stringify(cellMeta, null, 2)}
          onChange={(e) => {
            try {
              setCellMeta(JSON.parse(e.target.value));
              setError(null);
            } catch (err) {
              setError("Неверный JSON для объединения ячеек");
            }
          }}
          placeholder='{"0,0": {"rowspan": 2}}'
          rows={4}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Excel Importer */}
      {showExcelImporter && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Импорт из Excel/CSV</h3>
            <button
              type="button"
              onClick={() => setShowExcelImporter(false)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ✕
            </button>
          </div>
          <ExcelImporter onImport={handleExcelImport} />
        </div>
      )}

      {/* Excel Import Button */}
      {!showExcelImporter && (
        <button
          type="button"
          onClick={() => setShowExcelImporter(true)}
          className="w-full rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          📊 Импортировать из Excel/CSV
        </button>
      )}

      {/* Columns */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Колонки ({columns.length})
          </label>
          <button
            type="button"
            onClick={handleAddColumn}
            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Добавить колонку
          </button>
        </div>
        <div className="space-y-2">
          {columns.map((col, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={col.label}
                onChange={(e) => handleUpdateColumn(index, "label", e.target.value)}
                placeholder="Название"
                className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <select
                value={col.type}
                onChange={(e) => handleUpdateColumn(index, "type", e.target.value)}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="text">Текст</option>
                <option value="number">Число</option>
              </select>
              <input
                type="text"
                value={col.unit || ""}
                onChange={(e) => handleUpdateColumn(index, "unit", e.target.value)}
                placeholder="Единица"
                className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button
                type="button"
                onClick={() => handleRemoveColumn(index)}
                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Данные ({rows.length} строк)
          </label>
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
          >
            + Добавить строку
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="border border-zinc-300 bg-zinc-100 px-2 py-1 text-left dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {col.label}
                    {col.unit && ` (${col.unit})`}
                  </th>
                ))}
                <th className="border border-zinc-300 bg-zinc-100 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-zinc-300 p-0 dark:border-zinc-700"
                    >
                      <input
                        type={columns[colIndex].type === "number" ? "number" : "text"}
                        value={cell}
                        onChange={(e) =>
                          handleUpdateCell(rowIndex, colIndex, e.target.value)
                        }
                        className="w-full border-0 bg-transparent px-2 py-1 outline-none focus:bg-blue-50 dark:focus:bg-blue-950"
                      />
                    </td>
                  ))}
                  <td className="border border-zinc-300 px-2 py-1 text-center dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

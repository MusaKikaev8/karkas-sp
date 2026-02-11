"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import type { SpTableColumn } from "@/app/api/sp-tables/route";

interface ExcelImporterProps {
  onImport?: (data: {
    columns: SpTableColumn[];
    rows: (string | number)[][];
    title?: string;
  }) => void;
}

export function ExcelImporter({ onImport }: ExcelImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      // Check file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "text/plain",
      ];

      if (!validTypes.some((type) => file.type.includes(type)) && !file.name.endsWith('.csv')) {
        setError("Поддерживаются только Excel (.xlsx, .xls) и CSV файлы");
        setLoading(false);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      if (workbook.SheetNames.length === 0) {
        setError("Файл не содержит листов");
        setLoading(false);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON to preserve types
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      if (rawData.length === 0) {
        setError("Лист пустой");
        setLoading(false);
        return;
      }

      // First row is headers
      const headerRow = rawData[0];
      const dataRows = rawData.slice(1);

      if (headerRow.length === 0) {
        setError("Не найдены заголовки столбцов");
        setLoading(false);
        return;
      }

      // Create columns from headers
      const columns: SpTableColumn[] = headerRow.map((header, index) => {
        const headerStr = String(header || `Колонка ${index + 1}`).trim();

        // Try to detect if column is numeric by checking first few values
        let isNumeric = true;
        for (let i = 0; i < Math.min(3, dataRows.length); i++) {
          const val = dataRows[i]?.[index];
          if (val !== null && val !== undefined && val !== "") {
            if (isNaN(Number(val))) {
              isNumeric = false;
              break;
            }
          }
        }

        return {
          name: `col${index + 1}`,
          label: headerStr,
          type: isNumeric ? "number" : "text",
        };
      });

      // Convert rows to proper types
      const rows = dataRows.map((row) =>
        row.map((cell, colIndex) => {
          if (cell === null || cell === undefined || cell === "") {
            return "";
          }

          const column = columns[colIndex];
          if (column.type === "number") {
            const num = Number(cell);
            return isNaN(num) ? String(cell) : num;
          }

          return String(cell);
        })
      );

      // Filter out empty rows
      const nonEmptyRows = rows.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
      );

      if (nonEmptyRows.length === 0) {
        setError("В файле нет данных");
        setLoading(false);
        return;
      }

      onImport?.({
        columns,
        rows: nonEmptyRows,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      });

      setError(null);
    } catch (err) {
      setError(`Ошибка парсинга файла: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`block cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
          }`}
        >
          <div className="space-y-2">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {loading ? "Загрузка файла..." : "Перетащите Excel или CSV файл сюда"}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              или нажмите, чтобы выбрать файл
            </div>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        <p className="font-medium mb-1">💡 Подсказки:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Первая строка будет использована как названия колонок</li>
          <li>Типы колонок определяются автоматически (текст/число)</li>
          <li>Поддерживаются Excel 2007+ (.xlsx) и CSV файлы</li>
          <li>Пустые строки будут пропущены</li>
        </ul>
      </div>
    </div>
  );
}

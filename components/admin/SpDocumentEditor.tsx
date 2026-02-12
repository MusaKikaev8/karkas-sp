"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SpDocumentEditorProps {
  code: string;
  title: string;
  year: number;
  status: "действует" | "проект" | "утратил силу";
  sourceUrl: string | null;
  intro: string | null;
  preface: string | null;
}

export function SpDocumentEditor({
  code,
  title: initialTitle,
  year: initialYear,
  status: initialStatus,
  sourceUrl: initialSourceUrl,
  intro: initialIntro,
  preface: initialPreface,
}: SpDocumentEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialTitle,
    year: initialYear,
    status: initialStatus,
    sourceUrl: initialSourceUrl || "",
    intro: initialIntro || "",
    preface: initialPreface || "",
  });

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/sp/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при сохранении");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Вы уверены что хотите удалить "${initialTitle}"?\n\nЭто действие необратимо!`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sp/${encodeURIComponent(code)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при удалении");
      }

      router.push("/admin/sp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
      setIsDeleting(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">{initialTitle}</h2>
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Код: {code}</p>
              <p>Год: {initialYear}</p>
              <p>Статус: {initialStatus}</p>
              {initialIntro && <p className="mt-3 text-zinc-700 dark:text-zinc-300">{initialIntro}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={isSaving || isDeleting}
            >
              Редактировать
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 dark:text-red-400 hover:dark:text-red-300"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Редактирование СП</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            Название
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Год
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as typeof formData.status,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            >
              <option value="действует">Действует</option>
              <option value="проект">Проект</option>
              <option value="утратил силу">Утратил силу</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            URL источника (опционально)
          </label>
          <input
            type="url"
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            Введение (опционально)
          </label>
          <textarea
            value={formData.intro}
            onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
            placeholder="Введение в нормативный документ..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            Предисловие (опционально)
          </label>
          <textarea
            value={formData.preface}
            onChange={(e) => setFormData({ ...formData, preface: e.target.value })}
            placeholder="Предисловие к документу..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

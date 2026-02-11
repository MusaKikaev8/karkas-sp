"use client";

import { useEffect, useState } from "react";
import type { SpImageRecord } from "@/app/api/sp-images/route";

interface ImageManagerProps {
  spCode: string;
  clauseId: string;
}

const emptyForm = {
  imageUrl: "",
  caption: "",
  altText: "",
  sortOrder: "0",
  figureNumber: "",
};

export function ImageManager({ spCode, clauseId }: ImageManagerProps) {
  const [images, setImages] = useState<SpImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpImageRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Debug: Log received props
  useEffect(() => {
    console.log("ImageManager props:", { spCode, clauseId, spCodeType: typeof spCode, clauseIdType: typeof clauseId });
  }, [spCode, clauseId]);

  useEffect(() => {
    loadImages();
  }, [spCode, clauseId]);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sp-images?spCode=${encodeURIComponent(spCode)}&clauseId=${encodeURIComponent(clauseId)}`
      );
      const json = (await res.json()) as any;
      setImages(json.ok ? json.images : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFile(null);
  }

  function startEdit(img: SpImageRecord) {
    setEditing(img);
    setForm({
      imageUrl: img.image_url,
      caption: img.caption || "",
      altText: img.alt_text || "",
      sortOrder: String(img.sort_order ?? 0),
      figureNumber: "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let imageUrl = form.imageUrl.trim();

    if (!imageUrl && !file) {
      setError("Укажите ссылку на изображение или загрузите файл");
      return;
    }

    if (file) {
      setUploading(true);
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("spCode", spCode);
        uploadForm.append("clauseId", clauseId);

        // Debug: Log form data before upload
        console.log("Uploading with:", {
          spCode: String(spCode),
          clauseId: String(clauseId),
          fileName: file.name,
        });

        const uploadRes = await fetch("/api/sp-images/upload", {
          method: "POST",
          body: uploadForm,
        });

        const uploadJson = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok || !uploadJson?.url) {
          setError(uploadJson?.error || "Ошибка загрузки файла");
          return;
        }

        imageUrl = uploadJson.url;
      } finally {
        setUploading(false);
      }
    }

    const captionText = form.caption.trim();
    const figureNumber = form.figureNumber.trim();
    const fullCaption = figureNumber
      ? `Рисунок ${figureNumber}${captionText ? ` — ${captionText}` : ""}`
      : (captionText || undefined);

    const payload = {
      sp_code: spCode,
      clause_id: clauseId,
      image_url: imageUrl,
      caption: fullCaption,
      alt_text: form.altText.trim() || undefined,
      sort_order: Number(form.sortOrder) || 0,
    };

    try {
      const endpoint = editing ? `/api/sp-images?id=${editing.id}` : "/api/sp-images";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || "Ошибка сохранения");
        return;
      }

      await loadImages();
      resetForm();
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить изображение?")) return;

    try {
      const res = await fetch(`/api/sp-images?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Ошибка удаления");
        return;
      }
      await loadImages();
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Рисунки и схемы</div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Добавить изображение
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Ссылка на изображение (если без загрузки)
              </div>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </label>

            <label className="grid gap-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Загрузка файла (с ноутбука)
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-zinc-700 dark:text-zinc-300"
              />
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Можно выбрать файл вместо ссылки. При сохранении загрузим в Storage.
              </div>
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Номер рисунка
                </div>
                <input
                  value={form.figureNumber}
                  onChange={(e) => setForm({ ...form, figureNumber: e.target.value })}
                  placeholder="1"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
                />
              </label>
              <label className="grid gap-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Подпись
                </div>
                <input
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Рис. 1 - Схема..."
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
                />
              </label>
              <label className="grid gap-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Alt текст
                </div>
                <input
                  value={form.altText}
                  onChange={(e) => setForm({ ...form, altText: e.target.value })}
                  placeholder="Схема нагрузок"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
                />
              </label>
              <label className="grid gap-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Порядок
                </div>
                <input
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  type="number"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-700"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
              >
                {uploading ? "Загрузка..." : editing ? "Сохранить" : "Добавить"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка...</div>
        ) : images.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Изображения не добавлены
          </div>
        ) : (
          <div className="space-y-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {img.caption || "Без подписи"}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 break-all">
                    {img.image_url}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Порядок: {img.sort_order}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(img)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
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

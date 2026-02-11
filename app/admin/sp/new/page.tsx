"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { normalizeSpCode } from "@/lib/utils/sp-code";

type SpStatus = "действует" | "проект" | "утратил силу";

export default function NewSpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    year: new Date().getFullYear(),
    status: "проект" as SpStatus,
    sourceUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedCode = normalizeSpCode(formData.code.trim());
      const response = await fetch("/api/sp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          code: normalizedCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании СП");
      }

      const data = await response.json();
      router.push(`/admin/sp/${encodeURIComponent(data.code)}`);
    } catch (error) {
      console.error(error);
      alert("Ошибка при создании СП");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Создание нового СП
        </h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Заполните основную информацию о нормативном документе
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 p-6 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Код СП *
            </label>
            <input
              type="text"
              id="code"
              required
              placeholder="sp20.13330.2016"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Например: sp20.13330.2016
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Название *
            </label>
            <input
              type="text"
              id="title"
              required
              placeholder="СП 20.13330.2016 (Нагрузки и воздействия)"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="year"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Год *
              </label>
              <input
                type="number"
                id="year"
                required
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Статус *
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as SpStatus,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="проект">Проект</option>
                <option value="действует">Действует</option>
                <option value="утратил силу">Утратил силу</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sourceUrl"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Источник (URL)
            </label>
            <input
              type="url"
              id="sourceUrl"
              placeholder="https://fgiscs.minstroyrf.ru/"
              value={formData.sourceUrl}
              onChange={(e) =>
                setFormData({ ...formData, sourceUrl: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать СП"}
          </Button>
          <Link href="/admin/sp">
            <Button variant="outline" type="button">
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

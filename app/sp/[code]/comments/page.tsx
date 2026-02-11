import Link from "next/link";
import { notFound } from "next/navigation";

import { getSpDocument } from "@/lib/sp-data";

export default async function SpCommentsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const sp = getSpDocument(code);
  if (!sp) notFound();

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Обсуждения (заглушка)
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {sp.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Опциональный отдельный экран обсуждений по СП. В MVP комментарии живут
          на уровне пункта и калькулятора (localStorage).
        </p>
        <div className="mt-4">
          <Link
            href={`/sp/${sp.code}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Назад к СП
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        TODO: объединённая лента комментариев/модерация.
      </div>
    </div>
  );
}

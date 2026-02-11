import Link from "next/link";
import { notFound } from "next/navigation";

import { CalculatorForm } from "@/components/CalculatorForm";
import { CommentsBlock } from "@/components/CommentsBlock";
import { getDemoCalculator } from "@/lib/calculations/demo";
import { getCalculatorTitle, getSpDocument } from "@/lib/sp-data";

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ code: string; slug: string }>;
}) {
  const { code, slug } = await params;

  const sp = getSpDocument(code);
  if (!sp) notFound();

  const calculator = getDemoCalculator(slug);
  const calcTitle = getCalculatorTitle(code, slug) ?? calculator?.title;

  if (!calculator || !calcTitle) notFound();

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Калькулятор
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {calcTitle}
            </h1>
          </div>
          <Link
            href={`/sp/${code}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Назад к СП
          </Link>
        </div>
      </header>

      <CalculatorForm calculator={calculator} />

      <CommentsBlock
        entity={{ type: "calc", key: `${code}:calc:${slug}` }}
        title="Комментарии к калькулятору"
      />
    </div>
  );
}

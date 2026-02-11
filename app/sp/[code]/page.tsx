import { notFound } from "next/navigation";
import Link from "next/link";

import { CommentsBlock } from "@/components/CommentsBlock";
import { SpClauseView } from "@/components/SpClauseView";
import { SpToc } from "@/components/SpToc";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import type { SpClause } from "@/lib/sp-data";

export default async function SpDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ clause?: string }>;
}) {
  let { code } = await params;
  const spSearchParams = (await searchParams) ?? {};

  // Decode and normalize: sp20... → СП20...
  code = decodeURIComponent(code);
  code = normalizeSpCode(code);

  const supabase = await createSupabaseServerClient();

  // Load document
  const { data: document, error: docError } = await supabase
    .from("sp_documents")
    .select("*")
    .eq("code", code)
    .single();

  if (docError || !document) {
    notFound();
  }

  // Load clauses
  const { data: clausesData } = await supabase
    .from("sp_clauses")
    .select("id, sp_code, clause_id, title, summary")
    .eq("sp_code", code)
    .order("clause_id", { ascending: true });

  // Load calculators (if table exists)
  const { data: calculatorsData } = await supabase
    .from("sp_clause_calculators")
    .select("*")
    .eq("sp_code", code);

  // Transform to SpClause format
  const clauses: SpClause[] = (clausesData || []).map((row) => {
    const calc = (calculatorsData || [])
      .filter((c) => c.clause_id === row.clause_id)
      .map((c) => ({ slug: c.calculator_slug, title: c.calculator_title || c.calculator_slug }));

    return {
      id: row.clause_id,
      title: row.title,
      summary: row.summary || "",
      calculators: calc,
      formulaBlockIds: [],
    };
  });

  const defaultClauseId = clauses[0]?.id;
  const selectedClauseId = (spSearchParams.clause || defaultClauseId) ?? "";
  const clause = clauses.find((c) => c.id === selectedClauseId) ?? clauses[0];

  if (!clause) notFound();

  const sp = {
    code: document.code,
    title: document.title,
    year: document.year,
    status: document.status,
    sourceUrl: document.source_url || "",
    clauses,
  };

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
        >
          ← Назад к документам
        </Link>
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Нормативный документ
        </div>
        <div className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {sp.code}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          {sp.title}
        </h1>
        <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          Год: <span className="font-medium">{sp.year}</span> · Статус:{" "}
          <span className="font-medium">{sp.status}</span>
        </div>
      </section>

      <header className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">{sp.code}</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{sp.title}</h2>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Год: <span className="font-medium">{sp.year}</span> · Статус:{" "}
          <span className="font-medium">{sp.status}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SpToc
          code={sp.code}
          clauses={sp.clauses}
          selectedClauseId={clause.id}
        />

        <div className="grid gap-6">
          <SpClauseView code={sp.code} clause={clause} spSourceUrl={sp.sourceUrl} />
          <CommentsBlock
            entity={{ type: "clause", key: `${sp.code}:clause:${clause.id}` }}
            title={`Комментарии к пункту ${clause.id}`}
          />
        </div>
      </div>
    </div>
  );
}

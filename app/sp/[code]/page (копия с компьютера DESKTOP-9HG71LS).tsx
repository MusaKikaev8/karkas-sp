import { notFound } from "next/navigation";
import Link from "next/link";

import { CommentsBlock } from "@/components/CommentsBlock";
import { SpClauseView } from "@/components/SpClauseView";
import { SpToc } from "@/components/SpToc";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import { compareClauseIds } from "@/lib/utils/sp-order";
import type { SpClause, SpStatus } from "@/lib/sp-data";

export default async function SpDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ clause?: string }>;
}) {
  let { code } = await params;
  code = decodeURIComponent(code);
  code = normalizeSpCode(code);
  const spSearchParams = (await searchParams) ?? {};

  const supabase = await createSupabaseServerClient();

  const { data: document, error: docError } = await supabase
    .from("sp_documents")
    .select("code,title,year,status,source_url")
    .eq("code", code)
    .single();

  if (docError || !document) notFound();

  const { data: clausesData, error: clausesError } = await supabase
    .from("sp_clauses")
    .select("clause_id,title")
    .eq("sp_code", code)
    .order("clause_id", { ascending: true });

  if (clausesError) notFound();

  const { data: subclausesData, error: subclausesError } = await supabase
    .from("sp_subclauses")
    .select("parent_clause_id, subclause_id, title")
    .eq("sp_code", code)
    .order("subclause_id", { ascending: true });

  if (subclausesError) notFound();

  const topClauses: SpClause[] = (clausesData || []).map((row) => ({
    id: row.clause_id,
    title: row.title,
    summary: "",
    calculators: [],
  })).sort((a, b) => compareClauseIds(a.id, b.id));

  const subclauses = (subclausesData || []).map((row) => ({
    id: row.subclause_id,
    title: row.title,
    parentId: row.parent_clause_id,
  })).sort((a, b) => compareClauseIds(a.id, b.id));

  const clauses = topClauses.map((c) => ({
    ...c,
    children: subclauses.filter((s) => s.parentId === c.id),
  }));

  const flatClauses = [
    ...topClauses.map((c) => ({ id: c.id, title: c.title })),
    ...subclauses.map((c) => ({ id: c.id, title: c.title })),
  ];

  const defaultClauseId = flatClauses[0]?.id;
  const selectedClauseId = (spSearchParams.clause || defaultClauseId) ?? "";
  const clause = flatClauses.find((c) => c.id === selectedClauseId) ??
    flatClauses[0];

  if (!clause || clauses.length === 0) notFound();

  const sp = {
    code: document.code,
    title: document.title,
    year: document.year,
    status: document.status as SpStatus,
    sourceUrl: document.source_url ?? "",
    clauses,
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{sp.code}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{sp.title}</h1>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Год: <span className="font-medium">{sp.year}</span> · Статус:{" "}
              <span className="font-medium">{sp.status}</span>
            </div>
          </div>
          <Link
            href="/sp"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Назад
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SpToc
          code={sp.code}
          clauses={sp.clauses}
          selectedClauseId={clause.id}
        />

        <div className="grid gap-6">
          <SpClauseView
            code={sp.code}
            clause={{ id: clause.id, title: clause.title, summary: "", calculators: [] }}
            spSourceUrl={sp.sourceUrl}
            allowEdit={false}
          />
          <CommentsBlock
            entity={{ type: "clause", key: `${sp.code}:clause:${clause.id}` }}
            title={`Комментарии к пункту ${clause.id}`}
          />
        </div>
      </div>
    </div>
  );
}

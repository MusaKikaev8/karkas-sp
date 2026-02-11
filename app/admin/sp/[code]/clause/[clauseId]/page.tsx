import Link from "next/link";
import { notFound } from "next/navigation";

import { SpClauseView } from "@/components/SpClauseView";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import type { SpClause } from "@/lib/sp-data";

export default async function AdminClausePage({
  params,
}: {
  params: Promise<{ code: string; clauseId: string }>;
}) {
  let { code, clauseId } = await params;
  code = normalizeSpCode(decodeURIComponent(code));
  clauseId = decodeURIComponent(clauseId);

  const supabase = await createSupabaseServerClient();

  const { data: isFounder } = await supabase.rpc("is_founder");
  if (!isFounder) notFound();

  const { data: document } = await supabase
    .from("sp_documents")
    .select("code,title,year,status,source_url")
    .eq("code", code)
    .single();

  if (!document) notFound();

  const { data: clause } = await supabase
    .from("sp_clauses")
    .select("clause_id,title,summary")
    .eq("sp_code", code)
    .eq("clause_id", clauseId)
    .single();

  if (!clause) notFound();

  const spClause: SpClause = {
    id: clause.clause_id,
    title: clause.title,
    summary: clause.summary ?? "",
    calculators: [],
  };

  return (
    <div className="grid gap-6">
      <Link
        href={`/admin/sp/${encodeURIComponent(code)}`}
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Назад к списку пунктов
      </Link>

      <SpClauseView
        code={document.code}
        clause={spClause}
        spSourceUrl={document.source_url ?? ""}
        allowEdit
      />
    </div>
  );
}

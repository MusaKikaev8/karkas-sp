import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import { AddClauseForm } from "@/components/admin/AddClauseForm";
import { InlineClauseTextEditor } from "@/components/admin/InlineClauseTextEditor";
import { FormulaManager } from "@/components/admin/FormulaManager";
import { CustomFormulaManager } from "@/components/admin/CustomFormulaManager";
import { TableManager } from "@/components/admin/TableManager";
import { compareClauseIds } from "@/lib/utils/sp-order";

type SpDocument = {
  id: string;
  code: string;
  title: string;
  year: number;
  status: "действует" | "проект" | "утратил силу";
  source_url: string | null;
  created_at: string;
};

type SpClause = {
  id: string;
  sp_code: string;
  clause_id: string;
  title: string;
};

type SpSubclause = {
  id: string;
  sp_code: string;
  parent_clause_id: string;
  subclause_id: string;
  title: string;
};

export default async function EditSpPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  let { code } = await params;
  // Decode and normalize: sp20... → СП20...
  code = decodeURIComponent(code);
  code = normalizeSpCode(code);

  const supabase = await createSupabaseServerClient();

  // Check if user is founder
  const { data: isFounder, error: founderError } = await supabase.rpc(
    "is_founder"
  );

  if (!isFounder) {
    notFound();
  }

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
    .select("id, sp_code, clause_id, title")
    .eq("sp_code", code)
    .order("clause_id", { ascending: true });

  const clauses = (clausesData || []).sort((a: SpClause, b: SpClause) =>
    compareClauseIds(a.clause_id, b.clause_id)
  );

  const { data: subclausesData } = await supabase
    .from("sp_subclauses")
    .select("id, sp_code, parent_clause_id, subclause_id, title")
    .eq("sp_code", code)
    .order("subclause_id", { ascending: true });

  const subclauses = (subclausesData || []).sort((a: SpSubclause, b: SpSubclause) =>
    compareClauseIds(a.subclause_id, b.subclause_id)
  );
  const subclausesByParent = new Map<string, SpSubclause[]>();
  for (const sub of subclauses) {
    const list = subclausesByParent.get(sub.parent_clause_id) || [];
    list.push(sub);
    subclausesByParent.set(sub.parent_clause_id, list);
  }
  for (const [key, list] of subclausesByParent.entries()) {
    list.sort((a, b) => compareClauseIds(a.subclause_id, b.subclause_id));
    subclausesByParent.set(key, list);
  }

  function getStatusColor(status: SpDocument["status"]) {
    switch (status) {
      case "действует":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "проект":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "утратил силу":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
    }
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/admin/sp"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2 inline-block"
          >
            ← Назад к списку
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <code className="text-lg font-mono text-zinc-900 dark:text-zinc-100">
              {document.code}
            </code>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            {document.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Год: {document.year}
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Кастомные формулы */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Кастомные формулы СП</h2>
          <CustomFormulaManager spCode={code} />
        </section>

        {/* Пункты СП */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Пункты документа</h2>
          </div>

          <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 overflow-hidden">
            {clauses.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Нет добавленных пунктов
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {clauses.map((clause: SpClause) => (
                  <div key={clause.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2 block">
                          {clause.clause_id}
                        </code>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                          {clause.title}
                        </h3>
                        <InlineClauseTextEditor
                          spCode={code}
                          clauseId={clause.clause_id}
                          defaultSourceUrl={document.source_url ?? ""}
                        />
                        <FormulaManager
                          spCode={code}
                          clauseId={clause.clause_id}
                        />
                        <TableManager
                          spCode={code}
                          clauseId={clause.clause_id}
                        />
                        {(subclausesByParent.get(clause.clause_id) || []).length > 0 ? (
                          <div className="mt-4 grid gap-2">
                            {(subclausesByParent.get(clause.clause_id) || []).map(
                              (sub) => (
                                <div
                                  key={sub.id}
                                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                  <code className="text-xs font-mono text-blue-600 dark:text-blue-400 block">
                                    {sub.subclause_id}
                                  </code>
                                  <div className="text-sm text-zinc-900 dark:text-zinc-100">
                                    {sub.title}
                                  </div>
                                  <InlineClauseTextEditor
                                    spCode={code}
                                    clauseId={sub.subclause_id}
                                    defaultSourceUrl={document.source_url ?? ""}
                                  />
                                  <FormulaManager
                                    spCode={code}
                                    clauseId={sub.subclause_id}
                                  />
                                  <TableManager
                                    spCode={code}
                                    clauseId={sub.subclause_id}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Форма добавления пункта */}
        <section className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Добавить новый пункт</h2>
          <AddClauseForm spCode={code} parentClauses={clauses} />
        </section>
      </div>
    </div>
  );
}

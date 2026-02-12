import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import { InlineClauseTextEditor } from "@/components/admin/InlineClauseTextEditor";
import { FormulaManager } from "@/components/admin/FormulaManager";
import { CustomFormulaManager } from "@/components/admin/CustomFormulaManager";
import { TableManager } from "@/components/admin/TableManager";
import { ImageManager } from "@/components/admin/ImageManager";
import { SpDocumentEditor } from "@/components/admin/SpDocumentEditor";
import { ClausesTreeViewClient } from "@/components/admin/ClausesTreeViewClient";
import { AddClauseForm } from "@/components/admin/AddClauseForm";
import { compareClauseIds } from "@/lib/utils/sp-order";

type SpDocument = {
  id: string;
  code: string;
  title: string;
  year: number;
  status: "действует" | "проект" | "утратил силу";
  source_url: string | null;
  intro: string | null;
  preface: string | null;
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

  // Load clauses tree from new table
  const { data: clausesTreeData } = await supabase
    .from("sp_clauses_tree")
    .select("*")
    .eq("sp_code", code)
    .order("clause_id", { ascending: true });

  // Build tree structure from flat list
  const allNodes = clausesTreeData || [];
  const buildTree = (parentId: string | null = null): SpClause[] => {
    return allNodes
      .filter((node) => node.parent_id === parentId)
      .map((node) => ({
        id: node.id,
        sp_code: node.sp_code,
        clause_id: node.clause_id,
        title: node.title,
      }));
  };

  const clauses = buildTree(null);

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
        {/* Редактирование СП */}
        <SpDocumentEditor
          code={document.code}
          title={document.title}
          year={document.year}
          status={document.status}
          sourceUrl={document.source_url}
          intro={document.intro || null}
          preface={document.preface || null}
        />

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

          <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 p-6">
            {allNodes.length === 0 ? (
              <div className="text-center">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Нет добавленных пунктов
                </p>
              </div>
            ) : (
              <ClausesTreeViewClient spCode={code} sourceUrl={document.source_url ?? ""} />
            )}
          </div>
        </section>

        {/* Форма добавления пункта */}
        <section className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Добавить новый пункт</h2>
          <AddClauseForm spCode={code} />
        </section>
      </div>
    </div>
  );
}

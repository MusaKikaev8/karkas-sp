"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { InlineClauseTextEditor } from "./InlineClauseTextEditor";
import { FormulaManager } from "./FormulaManager";
import { TableManager } from "./TableManager";
import { ImageManager } from "./ImageManager";

interface ClauseTreeNode {
  id: string;
  sp_code: string;
  clause_id: string;
  title: string;
  parent_id: string | null;
  content_md: string | null;
  children?: ClauseTreeNode[];
}

interface ClausesTreeViewClientProps {
  spCode: string;
  sourceUrl: string;
}

export function ClausesTreeViewClient({
  spCode,
  sourceUrl,
}: ClausesTreeViewClientProps) {
  const [data, setData] = useState<ClauseTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [spCode]);

  const loadData = async () => {
    try {
      const response = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/clauses-tree`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка загрузки");
      }

      const tree = await response.json();
      setData(tree);
    } catch (err) {
      console.error("Error loading clauses tree:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderNode = (node: ClauseTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    return (
      <div key={node.id} className="border-b border-zinc-200 dark:border-zinc-800  last:border-b-0">
        <div
          className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer flex items-start gap-3"
          onClick={() => toggleExpanded(node.id)}
          style={{ paddingLeft: `${24 + level * 32}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mt-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4" />
          )}

          <div className="flex-1 min-w-0">
            <code className="text-sm font-mono text-blue-600 dark:text-blue-400 block mb-1">
              {node.clause_id}
            </code>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
              {node.title}
            </h4>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-200 dark:border-zinc-800 p-4"
            style={{ paddingLeft: `${24 + level * 32}px` }}>
            <div className="space-y-4">
              <InlineClauseTextEditor
                spCode={spCode}
                clauseId={node.clause_id}
                defaultSourceUrl={sourceUrl}
              />
              <FormulaManager spCode={spCode} clauseId={node.clause_id} />
              <TableManager spCode={spCode} clauseId={node.clause_id} />
              <ImageManager spCode={spCode} clauseId={node.clause_id} />
            </div>
          </div>
        )}

        {hasChildren && isExpanded &&  (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-sm text-zinc-600 dark:text-zinc-400">Загрузка...</div>;
  }

  return (
    <div>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Нет пунктов</p>
      ) : (
        data.map((node) => renderNode(node))
      )}
    </div>
  );
}

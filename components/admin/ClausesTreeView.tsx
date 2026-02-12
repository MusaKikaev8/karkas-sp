"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClauseTreeNode {
  id: string;
  sp_code: string;
  clause_id: string;
  title: string;
  parent_id: string | null;
  content_md: string | null;
  children?: ClauseTreeNode[];
}

interface ClausesTreeViewProps {
  spCode: string;
  data: ClauseTreeNode[];
  onRefresh?: () => void;
}

export function ClausesTreeView({
  spCode,
  data,
  onRefresh,
}: ClausesTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/clauses-tree`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, title: editTitle }),
        }
      );

      if (!response.ok) throw new Error("Ошибка сохранения");

      setEditingId(null);
      onRefresh?.();
    } catch (err) {
      alert("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClause = async (id: string, title: string) => {
    if (!confirm(`Удалить "${title}"? Это удалит все подпункты.`)) return;

    try {
      const response = await fetch(
        `/api/sp/${encodeURIComponent(spCode)}/clauses-tree`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) throw new Error("Ошибка удаления");

      onRefresh?.();
    } catch (err) {
      alert("Ошибка при удалении");
    }
  };

  const renderNode = (node: ClauseTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isEditing = editingId === node.id;

    return (
      <div key={node.id} className="mb-1">
        <div
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <code className="text-xs font-mono text-blue-600 dark:text-blue-400 flex-shrink-0">
            {node.clause_id}
          </code>

          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => saveEdit(node.id)}
                disabled={isSaving}
              >
                ✓
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                ✕
              </Button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">
                {node.title}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(node.id, node.title)}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                  title="Редактировать"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteClause(node.id, node.title)}
                  className="p-1 hover:bg-red-200 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                  title="Удалить"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {data.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Нет пунктов
        </p>
      ) : (
        data.map((node) => renderNode(node))
      )}
    </div>
  );
}

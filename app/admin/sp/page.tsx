import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";

export const metadata = {
  title: "Управление СП",
};

type SpDocument = {
  id: string;
  code: string;
  title: string;
  year: number;
  status: "действует" | "проект" | "утратил силу";
  source_url: string | null;
  created_at: string;
};

async function getSpDocuments() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sp_documents")
      .select("*")
      .order("year", { ascending: false });

    if (error) return [];
    return (data || []) as SpDocument[];
  } catch {
    return [];
  }
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

export default async function AdminSpPage() {
  const documents = await getSpDocuments();

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Управление сводами правил
          </h1>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Создание, редактирование и публикация нормативных документов
          </p>
        </div>
        <Link href="/admin/sp/new">
          <Button>+ Создать СП</Button>
        </Link>
      </header>

      <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Нет созданных СП
            </p>
            <Link href="/admin/sp/new">
              <Button variant="outline">Создать первый СП</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {documents.map((doc) => {
              const normalizedCode = normalizeSpCode(doc.code);
              return (
              <Link
                key={doc.id}
                href={`/admin/sp/${encodeURIComponent(normalizedCode)}`}
                className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                        {normalizedCode}
                      </code>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Год: {doc.year}
                    </p>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-500">
                    {new Date(doc.created_at).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

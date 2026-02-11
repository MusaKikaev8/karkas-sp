import Link from "next/link";
import type { SpClause } from "@/lib/sp-data";

export function SpToc({
  code,
  clauses,
  selectedClauseId,
}: {
  code: string;
  clauses: SpClause[];
  selectedClauseId: string;
}) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Оглавление
      </div>
      <ul className="mt-3 grid gap-1">
        {clauses.map((c) => {
          const isActive = c.id === selectedClauseId;
          return (
            <li key={c.id}>
              <Link
                href={`/sp/${encodeURIComponent(code)}?clause=${encodeURIComponent(c.id)}`}
                className={
                  "block rounded-xl px-3 py-2 text-sm transition " +
                  (isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800")
                }
              >
                <div className="text-xs opacity-80">{c.id}</div>
                <div className="font-medium leading-5">{c.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

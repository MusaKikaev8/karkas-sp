import Link from "next/link";

const ITEMS = [
  { slug: "beam", title: "Балка" },
  { slug: "column", title: "Колонна" },
  { slug: "slab", title: "Плита" },
];

export const metadata = {
  title: "Чек‑листы",
};

export default function ChecklistsPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Чек‑листы</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
          Заглушка под мастер пошагового расчёта конструкций. Позже сюда можно
          привязать шаги к калькуляторам.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <Link
            key={it.slug}
            href={`/checklists/${it.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-base font-semibold">{it.title}</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Открыть мастер →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

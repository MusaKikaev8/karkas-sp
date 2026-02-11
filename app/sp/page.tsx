import { SpList } from "@/components/SpList";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SpItem, SpStatus } from "@/lib/sp-data";

export const metadata = {
  title: "СП — список",
};

async function getSpList(): Promise<SpItem[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sp_documents")
      .select("code,title,year,status,source_url")
      .order("year", { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      code: row.code,
      title: row.title,
      year: row.year,
      status: row.status as SpStatus,
      sourceUrl: row.source_url ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function SpIndexPage() {
  const items = await getSpList();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Список СП</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
          Данные пока захардкожены в коде. Здесь будет поиск, фильтры и быстрый
          переход к пунктам и калькуляторам.
        </p>
      </header>

      <SpList items={items} />
    </div>
  );
}

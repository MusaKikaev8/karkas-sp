import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";

const MAX_RESULTS = 20;

function snippet(text: string, query: string): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const q = query.toLowerCase();
  const idx = clean.toLowerCase().indexOf(q);
  if (idx < 0) return clean.slice(0, 160);
  const start = Math.max(0, idx - 60);
  const end = Math.min(clean.length, idx + 100);
  return clean.slice(start, end);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const status = (url.searchParams.get("status") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const supabase = await createSupabaseServerClient();

  const term = `%${q}%`;

  // Separate images query due to Supabase filter syntax
  let imagesQuery = supabase
    .from("sp_images")
    .select("sp_code,clause_id,caption,alt_text")
    .eq("is_active", true);

  // Add filters for caption or alt_text
  const [docsRes, clausesRes, subclausesRes, textsRes, imagesRes] = await Promise.all([
    supabase
      .from("sp_documents")
      .select("code,title,year,status")
      .or(`code.ilike.${term},title.ilike.${term}`)
      .limit(MAX_RESULTS),
    supabase
      .from("sp_clauses")
      .select("sp_code,clause_id,title")
      .or(`clause_id.ilike.${term},title.ilike.${term}`)
      .limit(MAX_RESULTS),
    supabase
      .from("sp_subclauses")
      .select("sp_code,parent_clause_id,subclause_id,title")
      .or(`subclause_id.ilike.${term},title.ilike.${term}`)
      .limit(MAX_RESULTS),
    supabase
      .from("sp_clause_texts")
      .select("sp_code,clause_id,content_md")
      .ilike("content_md", term)
      .limit(MAX_RESULTS),
    imagesQuery.limit(MAX_RESULTS * 2), // Get more, filter in code
  ]);

  if (docsRes.error || clausesRes.error || subclausesRes.error || textsRes.error || imagesRes.error) {
    return NextResponse.json(
      { ok: false, error: "search_failed" },
      { status: 500 }
    );
  }

  const docs = (docsRes.data || [])
    .filter((d) => (status && status !== "все" ? d.status === status : true))
    .map((d) => ({
      type: "document",
      code: normalizeSpCode(d.code),
      title: d.title,
      year: d.year,
      status: d.status,
    }));

  const clauses = (clausesRes.data || []).map((c) => ({
    type: "clause",
    code: normalizeSpCode(c.sp_code),
    clauseId: c.clause_id,
    title: c.title,
  }));

  const subclauses = (subclausesRes.data || []).map((c) => ({
    type: "subclause",
    code: normalizeSpCode(c.sp_code),
    clauseId: c.subclause_id,
    title: c.title,
    parentClauseId: c.parent_clause_id,
  }));

  const texts = (textsRes.data || []).map((t) => ({
    type: "text",
    code: normalizeSpCode(t.sp_code),
    clauseId: t.clause_id,
    snippet: snippet(t.content_md || "", q),
  }));

  const images = (imagesRes.data || [])
    .filter((i) => {
      const text = `${i.caption || ""} ${i.alt_text || ""}`.toLowerCase();
      return text.includes(q.toLowerCase());
    })
    .map((i) => ({
      type: "image",
      code: normalizeSpCode(i.sp_code),
      clauseId: i.clause_id,
      title: i.caption || i.alt_text || "Изображение",
    }))
    .slice(0, MAX_RESULTS);

  console.log("Search results:", {
    query: q,
    imagesFound: images.length,
    imagesTotal: imagesRes.data?.length || 0,
  });

  return NextResponse.json({
    ok: true,
    results: [...docs, ...clauses, ...subclauses, ...texts, ...images],
  });
}

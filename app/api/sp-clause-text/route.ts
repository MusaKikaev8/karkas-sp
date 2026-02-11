import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

type UpsertClauseTextPayload = {
  spCode: string;
  clauseId: string;
  contentMd: string;
  sourceUrl: string;
};

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();
  const url = new URL(req.url);

  const spCode = url.searchParams.get("spCode")?.trim();
  const clauseId = url.searchParams.get("clauseId")?.trim();

  if (!spCode || !clauseId) {
    return NextResponse.json(
      { ok: false, error: "spCode_and_clauseId_required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("sp_clause_texts")
    .select("sp_code, clause_id, content_md, source_url, updated_at, updated_by")
    .eq("sp_code", spCode)
    .eq("clause_id", clauseId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, text: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const { data: isFounder } = await supabase.rpc("is_founder");
  if (!isFounder) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  let payload: UpsertClauseTextPayload;
  try {
    payload = (await req.json()) as UpsertClauseTextPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const spCode = payload.spCode?.trim();
  const clauseId = payload.clauseId?.trim();
  const contentMd = payload.contentMd?.trim();
  const sourceUrl = payload.sourceUrl?.trim();

  if (!spCode || !clauseId || !contentMd || !sourceUrl) {
    return NextResponse.json(
      { ok: false, error: "spCode_clauseId_contentMd_sourceUrl_required" },
      { status: 400 }
    );
  }

  if (contentMd.length > 50000) {
    return NextResponse.json(
      { ok: false, error: "content_too_long" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("sp_clause_texts")
    .upsert(
      {
        sp_code: spCode,
        clause_id: clauseId,
        content_md: contentMd,
        source_url: sourceUrl,
      },
      { onConflict: "sp_code,clause_id" }
    )
    .select("sp_code, clause_id, content_md, source_url, updated_at, updated_by")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, text: data });
}

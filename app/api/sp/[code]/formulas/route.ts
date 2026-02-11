import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";
import { getFormulaBlock } from "@/lib/formulas/registry";

async function requireFounder() {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  const { data: isFounder, error: founderError } = await supabase.rpc(
    "is_founder"
  );

  if (founderError || !isFounder) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return { ok: true, supabase } as const;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const url = new URL(request.url);
  const clauseId = url.searchParams.get("clauseId")?.trim();

  const supabase = await createSupabaseServerClient();
  let { code } = await params;
  code = normalizeSpCode(decodeURIComponent(code));

  let query = supabase
    .from("sp_formulas")
    .select("id, sp_code, clause_id, block_id, formula_number, title")
    .eq("sp_code", code);

  if (clauseId) query = query.eq("clause_id", clauseId);

  const { data, error } = await query.order("formula_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, formulas: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const auth = await requireFounder();
  if (!auth.ok) return auth.response;

  const supabase = auth.supabase;
  let { code } = await params;
  code = normalizeSpCode(decodeURIComponent(code));

  let body: {
    clause_id?: string;
    block_id?: string;
    formula_number?: string;
    title?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const clause_id = String(body.clause_id || "").trim();
  const block_id = String(body.block_id || "").trim();
  const formula_number = String(body.formula_number || "").trim();
  const title = String(body.title || "").trim();

  if (!clause_id || !block_id || !formula_number) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!getFormulaBlock(block_id)) {
    return NextResponse.json({ error: "unknown_formula" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("sp_formulas")
    .select("id")
    .eq("sp_code", code)
    .eq("clause_id", clause_id)
    .eq("formula_number", formula_number)
    .single();

  if (existing) {
    return NextResponse.json({ error: "duplicate_number" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("sp_formulas")
    .insert({
      sp_code: code,
      clause_id,
      block_id,
      formula_number,
      title: title || null,
      created_at: new Date().toISOString(),
    })
    .select("id, sp_code, clause_id, block_id, formula_number, title")
    .single();

  if (error) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const auth = await requireFounder();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }

  const supabase = auth.supabase;
  let { code } = await params;
  code = normalizeSpCode(decodeURIComponent(code));

  const { error } = await supabase
    .from("sp_formulas")
    .delete()
    .eq("sp_code", code)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSpCode } from "@/lib/supabase/helpers";

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

// GET /api/sp/[code]/clauses - получить пункты СП
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const auth = await requireFounder();
    if (!auth.ok) return auth.response;

    const supabase = auth.supabase;
    let { code } = await params;
    code = decodeURIComponent(code);
    code = normalizeSpCode(code);

    const { data, error } = await supabase
      .from("sp_clauses")
      .select("*")
      .eq("sp_code", code)
      .order("clause_id", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching clauses:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки пунктов" },
      { status: 500 }
    );
  }
}

// POST /api/sp/[code]/clauses - создать пункт СП
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const auth = await requireFounder();
    if (!auth.ok) return auth.response;

    const supabase = auth.supabase;
    let { code } = await params;
    code = decodeURIComponent(code);
    code = normalizeSpCode(code);
    const body = await request.json();
    const { clause_id, title } = body;

    if (!clause_id || !title) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      );
    }

    // Проверка на дубликат
    const { data: existing } = await supabase
      .from("sp_clauses")
      .select("id")
      .eq("sp_code", code)
      .eq("clause_id", clause_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Пункт с таким номером уже существует" },
        { status: 409 }
      );
    }

    // Создание
    const { data, error } = await supabase
      .from("sp_clauses")
      .insert({
        sp_code: code,
        clause_id,
        title,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating clause:", error);
    return NextResponse.json(
      { error: "Ошибка создания пункта" },
      { status: 500 }
    );
  }
}

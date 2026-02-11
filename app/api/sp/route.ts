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

// GET /api/sp - получить все СП
// POST /api/sp - создать новый СП
export async function GET() {
  try {
    const auth = await requireFounder();
    if (!auth.ok) return auth.response;

    const supabase = auth.supabase;

    const { data, error } = await supabase
      .from("sp_documents")
      .select("*")
      .order("year", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching SP documents:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки данных" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireFounder();
    if (!auth.ok) return auth.response;

    const supabase = auth.supabase;
    const body = await request.json();
    const { code, title, year, status, sourceUrl } = body;
    const normalizedCode = normalizeSpCode(String(code ?? "").trim());

    // Валидация
    if (!normalizedCode || !title || !year || !status) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    // Проверка на дубликат
    const { data: existing } = await supabase
      .from("sp_documents")
      .select("code")
      .eq("code", normalizedCode)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "СП с таким кодом уже существует" },
        { status: 409 }
      );
    }

    // Создание
    const { data, error } = await supabase
      .from("sp_documents")
      .insert({
        code: normalizedCode,
        title,
        year,
        status,
        source_url: sourceUrl || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating SP document:", error);
    return NextResponse.json(
      { error: "Ошибка создания документа" },
      { status: 500 }
    );
  }
}

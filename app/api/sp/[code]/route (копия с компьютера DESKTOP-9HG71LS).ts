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

// GET /api/sp/[code] - получить СП по коду
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
      .from("sp_documents")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "СП не найден" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching SP document:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки данных" },
      { status: 500 }
    );
  }
}

// PUT /api/sp/[code] - обновить СП
export async function PUT(
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
    const { title, year, status, sourceUrl } = body;

    const { data, error } = await supabase
      .from("sp_documents")
      .update({
        title,
        year,
        status,
        source_url: sourceUrl || null,
      })
      .eq("code", code)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating SP document:", error);
    return NextResponse.json(
      { error: "Ошибка обновления документа" },
      { status: 500 }
    );
  }
}

// DELETE /api/sp/[code] - удалить СП
export async function DELETE(
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

    const { error } = await supabase
      .from("sp_documents")
      .delete()
      .eq("code", code);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting SP document:", error);
    return NextResponse.json(
      { error: "Ошибка удаления документа" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

// GET /api/sp/[code]/clauses-tree - получить всё дерево пунктов
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    console.log("[clauses-tree GET] Called with params:", params);
    const supabase = await createSupabaseServerClient();
    let { code } = await params;
    console.log("[clauses-tree GET] Raw code:", code);
    code = decodeURIComponent(code);
    console.log("[clauses-tree GET] Decoded code:", code);

    const { data, error } = await supabase
      .from("sp_clauses_tree")
      .select("*")
      .eq("sp_code", code)
      .order("clause_id", { ascending: true });

    if (error) throw error;

    // Build tree structure
    const tree = buildTree(data || [], null);
    console.log("[clauses-tree GET] Returning tree with", data?.length || 0, "items");
    return NextResponse.json(tree);
  } catch (error) {
    console.error("[clauses-tree GET] Error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки пунктов" },
      { status: 500 }
    );
  }
}

// POST /api/sp/[code]/clauses-tree - создать новый пункт
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
    const body = await request.json();
    const { clause_id, title, parent_id } = body;

    if (!clause_id || !title) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("sp_clauses_tree")
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

    // Create
    const { data, error } = await supabase
      .from("sp_clauses_tree")
      .insert({
        sp_code: code,
        clause_id,
        title,
        parent_id: parent_id || null,
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

// PUT /api/sp/[code]/clauses-tree/[id] - обновить пункт
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
    const body = await request.json();
    const { id, title, content_md } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("sp_clauses_tree")
      .update({
        title,
        content_md: content_md || null,
      })
      .eq("id", id)
      .eq("sp_code", code)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating clause:", error);
    return NextResponse.json(
      { error: "Ошибка обновления пункта" },
      { status: 500 }
    );
  }
}

// DELETE /api/sp/[code]/clauses-tree/[id] - удалить пункт
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
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID пункта не указан" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("sp_clauses_tree")
      .delete()
      .eq("id", id)
      .eq("sp_code", code);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting clause:", error);
    return NextResponse.json(
      { error: "Ошибка удаления пункта" },
      { status: 500 }
    );
  }
}

// Helper: Build tree from flat array
function buildTree(
  items: any[],
  parentId: string | null
): any[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

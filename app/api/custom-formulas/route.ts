import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomFormulaRecord } from "@/lib/formulas/custom";

// Initialize Supabase service-role client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET /api/custom-formulas?spCode=... - получить список формул по spCode
// PUT /api/custom-formulas?id=... - редактировать формулу по id
// DELETE /api/custom-formulas?id=... - удалить формулу по id
// POST /api/custom-formulas?spCode=... - создать новую формулу

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const spCode = url.searchParams.get("spCode");

    if (!spCode) {
      return NextResponse.json({ error: "spCode required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("custom_formula_blocks")
      .select("*")
      .eq("sp_code", decodeURIComponent(spCode))
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      formulas: (data || []) as CustomFormulaRecord[],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const spCode = url.searchParams.get("spCode");

    if (!spCode) {
      return NextResponse.json({ error: "spCode required" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is founder
    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can create formulas" },
        { status: 403 }
      );
    }

    const user = authData.user.id;

    const body = await req.json();
    const {
      title,
      description,
      latex,
      params,
      expression,
      result_unit,
      result_label = "Результат",
    } = body;

    // Validate input
    if (!title?.trim() || !latex?.trim() || !expression?.trim()) {
      return NextResponse.json(
        { error: "Title, latex, and expression are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(params)) {
      return NextResponse.json(
        { error: "Params must be an array" },
        { status: 400 }
      );
    }

    // Validate expression syntax
    try {
      new Function("values", "Math", `return ${expression}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid expression syntax" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("custom_formula_blocks")
      .insert({
        sp_code: decodeURIComponent(spCode),
        created_by: user,
        title: title.trim(),
        description: description?.trim(),
        latex: latex.trim(),
        params,
        expression: expression.trim(),
        result_unit,
        result_label: result_label.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      formula: data as CustomFormulaRecord,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authData.user.id;

    const body = await req.json();
    const {
      title,
      description,
      latex,
      params: formulaParams,
      expression,
      result_unit,
      result_label = "Результат",
    } = body;

    // Validate input
    if (!title?.trim() || !latex?.trim() || !expression?.trim()) {
      return NextResponse.json(
        { error: "Title, latex, and expression are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(formulaParams)) {
      return NextResponse.json(
        { error: "Params must be an array" },
        { status: 400 }
      );
    }

    // Validate expression
    try {
      new Function("values", "Math", `return ${expression}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid expression syntax" },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from("custom_formula_blocks")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }

    if (existing.created_by !== user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("custom_formula_blocks")
      .update({
        title: title.trim(),
        description: description?.trim(),
        latex: latex.trim(),
        params: formulaParams,
        expression: expression.trim(),
        result_unit,
        result_label: result_label.trim(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      formula: data as CustomFormulaRecord,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authData.user.id;

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from("custom_formula_blocks")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }

    if (existing.created_by !== user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete (mark as inactive)
    const { error } = await supabaseAdmin
      .from("custom_formula_blocks")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

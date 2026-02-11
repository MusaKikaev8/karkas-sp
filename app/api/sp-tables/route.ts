import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Initialize Supabase service-role client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type SpTableColumn = {
  name: string;
  label: string;
  type: "text" | "number";
  unit?: string;
};

export type CellMeta = {
  rowspan?: number;
  colspan?: number;
  hidden?: boolean;
};

export type SpTableRecord = {
  id: string;
  sp_code: string;
  clause_id: string;
  title: string;
  description?: string;
  notes?: string;
  columns: SpTableColumn[];
  rows: (string | number)[][];
  cell_meta?: Record<string, CellMeta>; // "row,col" -> {rowspan, colspan, hidden}
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

// GET /api/sp-tables?spCode=...&clauseId=... - list tables
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const spCode = url.searchParams.get("spCode");
    const clauseId = url.searchParams.get("clauseId");

    let query = supabaseAdmin
      .from("sp_tables")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (spCode) {
      query = query.eq("sp_code", decodeURIComponent(spCode));
    }

    if (clauseId) {
      query = query.eq("clause_id", clauseId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      tables: (data || []) as SpTableRecord[],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/sp-tables - create table
export async function POST(req: NextRequest) {
  try {
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
        { error: "Forbidden: only founders can create tables" },
        { status: 403 }
      );
    }

    const user = authData.user.id;

    const body = await req.json();
    const { sp_code, clause_id, title, description, columns, rows } = body;

    // Validate input
    if (!sp_code?.trim() || !clause_id?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: "sp_code, clause_id, and title are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: "At least one column is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Rows must be an array" },
        { status: 400 }
      );
    }

    // Validate columns structure
    for (const col of columns) {
      if (!col.name || !col.label || !["text", "number"].includes(col.type)) {
        return NextResponse.json(
          { error: "Invalid column structure" },
          { status: 400 }
        );
      }
    }

    // Validate rows structure (each row should match column count)
    for (const row of rows) {
      if (!Array.isArray(row) || row.length !== columns.length) {
        return NextResponse.json(
          { error: "Each row must have values for all columns" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("sp_tables")
      .insert({
        sp_code: sp_code.trim(),
        clause_id: clause_id.trim(),
        title: title.trim(),
        description: description?.trim(),
        columns,
        rows,
        created_by: user,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      table: data as SpTableRecord,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT /api/sp-tables?id=... - update table
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

    // Check if user is founder
    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can update tables" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, columns, rows } = body;

    // Validate input
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: "At least one column is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Rows must be an array" },
        { status: 400 }
      );
    }

    // Validate columns structure
    for (const col of columns) {
      if (!col.name || !col.label || !["text", "number"].includes(col.type)) {
        return NextResponse.json(
          { error: "Invalid column structure" },
          { status: 400 }
        );
      }
    }

    // Validate rows structure
    for (const row of rows) {
      if (!Array.isArray(row) || row.length !== columns.length) {
        return NextResponse.json(
          { error: "Each row must have values for all columns" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("sp_tables")
      .update({
        title: title.trim(),
        description: description?.trim(),
        columns,
        rows,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      table: data as SpTableRecord,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/sp-tables?id=... - soft delete table
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

    // Check if user is founder
    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can delete tables" },
        { status: 403 }
      );
    }

    // Soft delete (mark as inactive)
    const { error } = await supabaseAdmin
      .from("sp_tables")
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

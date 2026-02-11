import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Initialize Supabase service-role client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type SpImageRecord = {
  id: string;
  sp_code: string;
  clause_id: string;
  image_url: string;
  caption?: string | null;
  alt_text?: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

// GET /api/sp-images?spCode=...&clauseId=... - list images
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const spCode = url.searchParams.get("spCode");
    const clauseId = url.searchParams.get("clauseId");

    let query = supabaseAdmin
      .from("sp_images")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

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
      images: (data || []) as SpImageRecord[],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/sp-images - create image
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can create images" },
        { status: 403 }
      );
    }

    const user = authData.user.id;
    const body = await req.json();
    const { sp_code, clause_id, image_url, caption, alt_text, sort_order } = body;

    if (!sp_code?.trim() || !clause_id?.trim() || !image_url?.trim()) {
      return NextResponse.json(
        { error: "sp_code, clause_id, and image_url are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("sp_images")
      .insert({
        sp_code: sp_code.trim(),
        clause_id: clause_id.trim(),
        image_url: image_url.trim(),
        caption: caption?.trim() || null,
        alt_text: alt_text?.trim() || null,
        sort_order: Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        created_by: user,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, image: data as SpImageRecord });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT /api/sp-images?id=... - update image
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can update images" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { image_url, caption, alt_text, sort_order } = body;

    const payload: Record<string, any> = {};
    if (typeof image_url === "string" && image_url.trim()) {
      payload.image_url = image_url.trim();
    }
    if (typeof caption === "string") {
      payload.caption = caption.trim() || null;
    }
    if (typeof alt_text === "string") {
      payload.alt_text = alt_text.trim() || null;
    }
    if (Number.isFinite(Number(sort_order))) {
      payload.sort_order = Number(sort_order);
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("sp_images")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, image: data as SpImageRecord });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/sp-images?id=... - soft delete image
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: isFounder, error: founderError } = await supabase.rpc(
      "is_founder"
    );

    if (founderError || !isFounder) {
      return NextResponse.json(
        { error: "Forbidden: only founders can delete images" },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("sp_images")
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

import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

type EntityType = "clause" | "calc";

function isEntityType(value: string | null): value is EntityType {
  return value === "clause" || value === "calc";
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();

  const url = new URL(req.url);
  const entityTypeRaw = url.searchParams.get("entityType");
  const entityKey = url.searchParams.get("entityKey")?.trim();

  if (!isEntityType(entityTypeRaw) || !entityKey) {
    return NextResponse.json(
      { ok: false, error: "entityType_and_entityKey_required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: isFounder } = await supabase.rpc("is_founder");

  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, entity_type, entity_key, author_id, body, visibility, created_at, approved_at, approved_by"
    )
    .eq("entity_type", entityTypeRaw)
    .eq("entity_key", entityKey)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const publicComments = data.filter((c) => c.visibility === "public");

  const mine = user ? data.filter((c) => c.author_id === user.id) : [];

  const pending = Boolean(isFounder)
    ? data.filter((c) => c.visibility === "pending")
    : mine.filter((c) => c.visibility === "pending");

  return NextResponse.json({
    ok: true,
    user: user ? { id: user.id, email: user.email } : null,
    isFounder: Boolean(isFounder),
    comments: {
      public: publicComments,
      mine,
      pending,
    },
  });
}

type CreateCommentPayload = {
  entityType: EntityType;
  entityKey: string;
  body: string;
  visibility?: "pending" | "private" | "public";
};

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

  let payload: CreateCommentPayload;
  try {
    payload = (await req.json()) as CreateCommentPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  if (!payload || !isEntityType(payload.entityType)) {
    return NextResponse.json(
      { ok: false, error: "invalid_entityType" },
      { status: 400 }
    );
  }

  const entityKey = payload.entityKey?.trim();
  const body = payload.body?.trim();
  const visibility = payload.visibility ?? "pending";

  if (!entityKey) {
    return NextResponse.json(
      { ok: false, error: "entityKey_required" },
      { status: 400 }
    );
  }

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "body_required" },
      { status: 400 }
    );
  }

  if (body.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "body_too_long" },
      { status: 400 }
    );
  }

  const { data: isFounder } = await supabase.rpc("is_founder");
  if (visibility === "public" && !isFounder) {
    return NextResponse.json(
      { ok: false, error: "public_requires_founder" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      entity_type: payload.entityType,
      entity_key: entityKey,
      author_id: user.id,
      body,
      visibility,
    })
    .select(
      "id, entity_type, entity_key, author_id, body, visibility, created_at, approved_at, approved_by"
    )
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, comment: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();
  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "id_required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

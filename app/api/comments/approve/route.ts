import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

type ApprovePayload = {
  commentId: string;
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

  const { data: isFounder } = await supabase.rpc("is_founder");
  if (!isFounder) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  let payload: ApprovePayload;
  try {
    payload = (await req.json()) as ApprovePayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const commentId = payload.commentId?.trim();
  if (!commentId) {
    return NextResponse.json(
      { ok: false, error: "commentId_required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .update({
      visibility: "public",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("id", commentId)
    .select(
      "id, entity_type, entity_key, author_id, body, visibility, created_at, approved_at, approved_by"
    )
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, comment: data });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "sp-images";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function sanitizeFileName(fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.length > 0 ? safe : `image_${Date.now()}.bin`;
}

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
        { error: "Forbidden: only founders can upload images" },
        { status: 403 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const spCode = String(form.get("spCode") || "").trim();
    const clauseId = String(form.get("clauseId") || "").trim();

    console.log("Upload route received:", { spCode, clauseId, fileSize: file instanceof File ? file.size : 0 });

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    if (!spCode || !clauseId) {
      return NextResponse.json(
        { error: "spCode_and_clauseId_required" },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(file.name || "image");
    // Replace invalid characters in spCode and clauseId for safe path
    const safeSpCode = spCode.replace(/[^a-zA-Z0-9\-_]/g, "_");
    const safeClauseId = clauseId.replace(/[^a-zA-Z0-9\-_]/g, "_");
    const filePath = `${safeSpCode}/${safeClauseId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      path: filePath,
      url: publicData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

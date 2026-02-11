import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(req: NextRequest) {
  try {
    // Debug: check cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log("All cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const supabase = await createSupabaseRouteClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("getUser result:", { user: user?.id, error: userError?.message });

    if (userError) {
      console.error("Auth error:", userError);
      return NextResponse.json(
        { ok: false, error: "unauthorized", debug: { cookieCount: allCookies.length, userError: userError.message } },
        { status: 401 }
      );
    }

    // Try to call is_founder RPC
    let isFounder = false;
    try {
      console.log("Calling is_founder RPC for user:", user?.id);
      const { data, error: founderError } = await supabase.rpc("is_founder");
      console.log("is_founder RPC result:", { data, error: founderError });
      if (founderError) {
        console.error("RPC is_founder error:", founderError);
        // Function might not exist yet, default to false
      } else {
        isFounder = Boolean(data);
        console.log("isFounder final value:", isFounder);
      }
    } catch (e) {
      console.error("Exception calling is_founder:", e);
      // Default to false
    }

    return NextResponse.json({
      ok: true,
      user: user ? { id: user.id, email: user.email } : null,
      isFounder,
    });
  } catch (e) {
    console.error("Unexpected error in /api/me:", e);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

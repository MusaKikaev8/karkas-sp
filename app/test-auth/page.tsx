"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function TestAuthPage() {
  const [clientAuth, setClientAuth] = useState<any>(null);
  const [serverAuth, setServerAuth] = useState<any>(null);

  useEffect(() => {
    async function check() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return; // Supabase client not available
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      setClientAuth({
        authenticated: !!user,
        userId: user?.id,
        email: user?.email,
        hasSession: !!session,
        accessToken: session?.access_token ? "present" : "missing"
      });

      // Check server-side
      const res = await fetch("/api/me");
      const json = await res.json();
      setServerAuth(json);
    }
    check();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug</h1>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Client-side Auth</h2>
          <pre className="text-xs bg-zinc-100 p-3 rounded overflow-auto">
            {JSON.stringify(clientAuth, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Server-side Auth (/api/me)</h2>
          <pre className="text-xs bg-zinc-100 p-3 rounded overflow-auto">
            {JSON.stringify(serverAuth, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

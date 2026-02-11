import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TestFounderPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  let founderCheckResult = null;
  let founderError = null;
  
  if (user) {
    const { data, error } = await supabase.rpc("is_founder");
    founderCheckResult = data;
    founderError = error;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug: Founder Check</h1>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">User Status</h2>
          <pre className="text-xs bg-zinc-100 p-3 rounded overflow-auto">
            {JSON.stringify({ 
              authenticated: !!user,
              userId: user?.id,
              email: user?.email,
              userError: userError?.message 
            }, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">is_founder() RPC Result</h2>
          <pre className="text-xs bg-zinc-100 p-3 rounded overflow-auto">
            {JSON.stringify({
              result: founderCheckResult,
              error: founderError?.message,
              errorDetails: founderError
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

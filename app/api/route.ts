import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "API index. This project uses Next.js route handlers under /api/*.",
    endpoints: {
      me: {
        method: "GET",
        url: "/api/me",
        note: "Returns { user, isFounder } when Supabase env is configured.",
      },
      comments: {
        method: "GET/POST/DELETE",
        url: "/api/comments?entityType=clause|calc&entityKey=...",
      },
      approveComment: {
        method: "POST",
        url: "/api/comments/approve",
        body: { commentId: "uuid" },
      },
      spClauseText: {
        method: "GET/POST",
        url: "/api/sp-clause-text?spCode=...&clauseId=...",
      },
      subscription: {
        method: "GET",
        url: "/api/subscription",
      },
    },
    hint:
      "If you previously opened a different copy of the project, ensure you're running the dev server from the folder \"...\\Конструирование\\...\" (Cyrillic), not \"...\\Конstruирование\\...\".",
  });
}

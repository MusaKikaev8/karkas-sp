import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "stub",
    plan: null,
    message: "API заглушка: позже подключим оплату и статус подписки.",
  });
}

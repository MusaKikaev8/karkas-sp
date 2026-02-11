import { NextResponse, type NextRequest } from "next/server";

import { getFormulaBlock } from "@/lib/formulas/registry";
import { getCustomFormulaBlock } from "@/lib/formulas/custom-registry";

type ComputePayload = {
  blockId: string;
  values: Record<string, number>;
  spCode?: string; // For custom formulas
};

export async function POST(req: NextRequest) {
  let payload: ComputePayload;
  try {
    payload = (await req.json()) as ComputePayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const blockId = String(payload.blockId || "").trim();
  if (!blockId) {
    return NextResponse.json({ error: "block_id_required" }, { status: 400 });
  }

  // Try built-in formulas first
  let block = getFormulaBlock(blockId);

  // If not found and spCode is provided, try custom formulas
  if (!block && payload.spCode) {
    block = await getCustomFormulaBlock(blockId, payload.spCode);
  }

  if (!block) {
    return NextResponse.json({ error: "unknown_formula" }, { status: 404 });
  }

  const values = payload.values || {};
  try {
    const result = block.calculate(values);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "compute_failed" }, { status: 400 });
  }
}

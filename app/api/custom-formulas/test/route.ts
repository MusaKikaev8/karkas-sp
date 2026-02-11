import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { expression, values } = await req.json();

    if (!expression || typeof expression !== "string") {
      return NextResponse.json(
        { error: "Expression is required" },
        { status: 400 }
      );
    }

    if (!values || typeof values !== "object") {
      return NextResponse.json(
        { error: "Values must be an object" },
        { status: 400 }
      );
    }

    try {
      const fn = new Function("values", "Math", `return ${expression}`);
      const result = fn(values, Math);

      if (typeof result !== "number" || isNaN(result)) {
        return NextResponse.json(
          { error: "Expression must return a number" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        result,
      });
    } catch (error) {
      return NextResponse.json(
        { error: `Execution error: ${error}` },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

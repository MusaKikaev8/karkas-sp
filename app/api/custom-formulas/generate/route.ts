import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Ты — эксперт по строительным расчётам и программированию. Твоя задача — создавать JSON описания формул для калькулятора.

ФОРМАТ ОТВЕТА (строго JSON, без комментариев):
{
  "title": "Название формулы",
  "description": "Краткое описание (опционально)",
  "latex": "LaTeX формула для отображения",
  "params": [
    {
      "name": "имя_переменной",
      "label": "Отображаемое название",
      "unit": "единица измерения",
      "min": минимум,
      "max": максимум (опционально)
    }
  ],
  "expression": "JavaScript выражение",
  "result_label": "Название результата",
  "result_unit": "Единица результата"
}

ПРАВИЛА:
1. "name" в params - только латиница, без пробелов (например: "N", "A", "b", "h")
2. "expression" - JavaScript код, используй values.имя_параметра
3. Доступны: values.*, Math.* (PI, sqrt, pow, sin, cos, etc.)
4. LaTeX: используй \\dfrac{a}{b} для дробей, \\times для умножения, ^ для степени
5. Возвращай ТОЛЬКО валидный JSON, без пояснений

ПРИМЕРЫ:

Запрос: "Формула для расчёта напряжения при сжатии"
Ответ:
{
  "title": "Напряжение при осевом сжатии",
  "latex": "\\\\sigma = \\\\dfrac{N}{A}",
  "params": [
    {"name": "N", "label": "Осевая сила", "unit": "кН", "min": 0},
    {"name": "A", "label": "Площадь сечения", "unit": "мм²", "min": 1}
  ],
  "expression": "(values.N * 1000) / values.A",
  "result_label": "σ",
  "result_unit": "МПа"
}

Запрос: "Площадь прямоугольника"
Ответ:
{
  "title": "Площадь прямоугольного сечения",
  "latex": "A = b \\\\times h",
  "params": [
    {"name": "b", "label": "Ширина", "unit": "мм", "min": 1},
    {"name": "h", "label": "Высота", "unit": "мм", "min": 1}
  ],
  "expression": "values.b * values.h",
  "result_label": "Площадь",
  "result_unit": "мм²"
}`;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is founder
    const { data: isFounder, error: founderError } = await supabase.rpc("is_founder");
    if (founderError || !isFounder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use DeepSeek API only
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!deepseekApiKey) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured. Add DEEPSEEK_API_KEY to .env" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepSeek API error:", error);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let formula;
    try {
      // Try to extract JSON if LLM added extra text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : generatedText;
      formula = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      return NextResponse.json(
        { error: "Invalid JSON from AI", raw: generatedText },
        { status: 500 }
      );
    }

    // Validate the formula structure
    if (!formula.title || !formula.latex || !Array.isArray(formula.params) || !formula.expression) {
      return NextResponse.json(
        { error: "Invalid formula structure from AI", formula },
        { status: 400 }
      );
    }

    // Validate JavaScript expression
    try {
      new Function("values", "Math", `return ${formula.expression}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid expression generated", expression: formula.expression },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      formula,
    });
  } catch (error) {
    console.error("Generate formula error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

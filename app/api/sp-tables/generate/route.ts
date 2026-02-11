import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Ты — эксперт по строительным нормативам и программированию. Твоя задача — создавать JSON описания нормативных таблиц для СП.

ФОРМАТ ОТВЕТА (строго JSON, без комментариев):
{
  "title": "Название таблицы",
  "description": "Краткое описание (опционально)",
  "notes": "Примечания к таблице (опционально)",
  "columns": [
    {
      "name": "имя_колонки",
      "label": "Отображаемое название",
      "type": "text" или "number",
      "unit": "единица измерения (опционально)"
    }
  ],
  "rows": [
    [значение1, значение2, ...],
    [значение1, значение2, ...]
  ],
  "cell_meta": {
    "row_index,col_index": {
      "rowspan": число_строк,
      "colspan": число_колонок,
      "hidden": true (если ячейка скрыта из-за объединения)
    }
  }
}

ПРАВИЛА:
1. "name" в columns - только латиница, без пробелов (например: "type", "coef", "value")
2. "type" в columns - только "text" или "number"
3. Данные в rows должны соответствовать типам колонок
4. cell_meta используется для объединения ячеек (если требуется)
5. Примечания (notes) в формате markdown
6. Возвращай ТОЛЬКО валидный JSON, без пояснений

ПРИМЕРЫ:

Запрос: "Таблица коэффициентов снеговой нагрузки для 3 регионов"
Ответ:
{
  "title": "Коэффициенты снеговой нагрузки по регионам",
  "description": "Расчетные коэффициенты для определения снеговой нагрузки",
  "notes": "Коэффициенты приведены для средних условий. Для особых случаев применять повышающие коэффициенты согласно п. 10.4",
  "columns": [
    {"name": "region", "label": "Снеговой район", "type": "text"},
    {"name": "s0", "label": "S₀", "type": "number", "unit": "кПа"},
    {"name": "coef", "label": "Коэффициент", "type": "number"}
  ],
  "rows": [
    ["I", 0.8, 1.0],
    ["II", 1.2, 1.0],
    ["III", 1.8, 1.0]
  ]
}

Запрос: "Таблица классов бетона с объединенными ячейками в заголовке"
Ответ:
{
  "title": "Классы бетона и их характеристики",
  "columns": [
    {"name": "class", "label": "Класс", "type": "text"},
    {"name": "rb", "label": "Rb", "type": "number", "unit": "МПа"},
    {"name": "rbt", "label": "Rbt", "type": "number", "unit": "МПа"}
  ],
  "rows": [
    ["B15", 8.5, 0.75],
    ["B20", 11.5, 0.90],
    ["B25", 14.5, 1.05]
  ],
  "notes": "Rb - расчетное сопротивление сжатию; Rbt - расчетное сопротивление растяжению"
}

Запрос: "Таблица с объединенными ячейками: типы нагрузок и коэффициенты"
Ответ:
{
  "title": "Коэффициенты надежности по нагрузке",
  "columns": [
    {"name": "type", "label": "Тип нагрузки", "type": "text"},
    {"name": "perm", "label": "Постоянная", "type": "number"},
    {"name": "temp", "label": "Временная", "type": "number"}
  ],
  "rows": [
    ["Собственный вес", 1.1, 1.2],
    ["Металлические конструкции", 1.05, 1.2],
    ["Снег", 1.1, 1.4],
    ["Ветер", 1.1, 1.4]
  ],
  "cell_meta": {
    "0,0": {"rowspan": 2},
    "1,0": {"hidden": true}
  },
  "notes": "¹) Для металлических конструкций применяется пониженный коэффициент\\n²) Для особых сочетаний коэффициенты снижаются на 0.1"
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

    // Use DeepSeek API
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
        max_tokens: 2000,
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
    let table;
    try {
      // Try to extract JSON if LLM added extra text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : generatedText;
      table = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      return NextResponse.json(
        { error: "Invalid JSON from AI", raw: generatedText },
        { status: 500 }
      );
    }

    // Validate the table structure
    if (!table.title || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
      return NextResponse.json(
        { error: "Invalid table structure from AI", table },
        { status: 400 }
      );
    }

    if (table.columns.length === 0) {
      return NextResponse.json(
        { error: "Table must have at least one column" },
        { status: 400 }
      );
    }

    // Validate column structure
    for (const col of table.columns) {
      if (!col.name || !col.label || !["text", "number"].includes(col.type)) {
        return NextResponse.json(
          { error: "Invalid column structure", column: col },
          { status: 400 }
        );
      }
    }

    // Validate rows structure
    for (const row of table.rows) {
      if (!Array.isArray(row) || row.length !== table.columns.length) {
        return NextResponse.json(
          { error: "Row length must match column count", row },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      table,
    });
  } catch (error) {
    console.error("Generate table error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

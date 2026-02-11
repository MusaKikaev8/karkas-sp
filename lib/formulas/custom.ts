import type { FormulaParam, FormulaBlock } from "@/lib/formulas/types";

export type CustomFormulaRecord = {
  id: string;
  sp_code: string;
  created_by: string;
  title: string;
  description?: string;
  latex: string;
  params: FormulaParam[];
  expression: string;
  result_unit?: string;
  result_label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Convert DB record to FormulaBlock
export function customRecordToFormulaBlock(record: CustomFormulaRecord): FormulaBlock {
  return {
    id: record.id,
    title: record.title,
    latex: record.latex,
    description: record.description,
    params: record.params,
    calculate(values: Record<string, number>) {
      try {
        // Safe function execution with limited scope
        const fn = new Function(
          "values",
          "Math",
          `return ${record.expression}`
        );
        const resultValue = fn(values, Math);

        if (typeof resultValue !== "number" || isNaN(resultValue)) {
          throw new Error("Invalid result");
        }

        return {
          result: {
            label: record.result_label,
            value: resultValue,
            unit: record.result_unit,
          },
          steps: record.params.map((param) => ({
            label: param.label,
            value: values[param.name],
            unit: param.unit,
          })),
        };
      } catch (error) {
        throw new Error(`Calculation failed: ${error}`);
      }
    },
  };
}

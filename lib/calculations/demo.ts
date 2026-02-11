export type CalcField = {
  name: string;
  label: string;
  unit?: string;
  placeholder?: string;
  min?: number;
};

export type CalcStep = {
  label: string;
  value: number;
  unit?: string;
};

export type CalcResult = {
  result: CalcStep;
  steps: CalcStep[];
};

export type CalculatorDefinition = {
  slug: string;
  title: string;
  description?: string;
  fields: CalcField[];
  calculate: (values: Record<string, number>) => CalcResult;
};

export const DEMO_CALCULATORS: Record<string, CalculatorDefinition> = {
  "rectangle-area": {
    slug: "rectangle-area",
    title: "Площадь прямоугольника",
    description: "Демо‑калькулятор: S = b × h.",
    fields: [
      {
        name: "width",
        label: "Ширина b",
        unit: "м",
        placeholder: "например, 2.4",
        min: 0,
      },
      {
        name: "height",
        label: "Высота h",
        unit: "м",
        placeholder: "например, 3.0",
        min: 0,
      },
    ],
    calculate: (values) => {
      const width = values.width;
      const height = values.height;
      const area = width * height;

      return {
        result: { label: "Площадь S", value: area, unit: "м²" },
        steps: [
          { label: "Ширина b", value: width, unit: "м" },
          { label: "Высота h", value: height, unit: "м" },
          { label: "Произведение b × h", value: area, unit: "м²" },
        ],
      };
    },
  },
};

export function getDemoCalculator(slug: string): CalculatorDefinition | undefined {
  return DEMO_CALCULATORS[slug];
}

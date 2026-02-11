export type FormulaParam = {
  name: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
};

export type FormulaStep = {
  label: string;
  value: number;
  unit?: string;
};

export type FormulaResult = {
  label: string;
  value: number;
  unit?: string;
};

export type FormulaCalcOutput = {
  result: FormulaResult;
  steps: FormulaStep[];
};

export type FormulaBlock = {
  id: string;
  title: string;
  latex: string;
  description?: string;
  params: FormulaParam[];
  calculate(values: Record<string, number>): FormulaCalcOutput;
};

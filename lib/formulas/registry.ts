import type { FormulaBlock } from "@/lib/formulas/types";

function round(value: number, digits = 6) {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
}

// Unit helpers
const kN_to_N = (kN: number) => kN * 1000;
const N_to_kN = (N: number) => N / 1000;
const kNm_to_Nmm = (kNm: number) => kNm * 1_000_000; // 1 kN·m = 1e6 N·mm

export const FORMULA_REGISTRY: Record<string, FormulaBlock> = {
  "steel-axial-stress": {
    id: "steel-axial-stress",
    title: "Нормальное напряжение от осевой силы",
    latex: String.raw`\sigma = \dfrac{N}{A}`,
    description:
      "Нейтральная формула: осевая сила N распределяется по площади A. Единицы приведены к MPa (N/mm²).",
    params: [
      {
        name: "N_kN",
        label: "Осевая сила N",
        unit: "кН",
        min: 0,
        placeholder: "например, 250",
      },
      {
        name: "A_mm2",
        label: "Площадь A",
        unit: "мм²",
        min: 1e-9,
        placeholder: "например, 1500",
      },
    ],
    calculate(values) {
      const N = kN_to_N(values.N_kN);
      const A = values.A_mm2;
      const sigma = N / A; // N/mm^2 = MPa
      return {
        result: { label: "σ", value: round(sigma), unit: "МПа" },
        steps: [
          { label: "N", value: round(N), unit: "Н" },
          { label: "A", value: round(A), unit: "мм²" },
        ],
      };
    },
  },

  "steel-shear-stress": {
    id: "steel-shear-stress",
    title: "Касательное напряжение (по заданной площади среза)",
    latex: String.raw`\tau = \dfrac{V}{A_w}`,
    description:
      "Нейтральная формула: поперечная сила V распределяется по площади среза Aw (задаётся пользователем).",
    params: [
      {
        name: "V_kN",
        label: "Поперечная сила V",
        unit: "кН",
        min: 0,
        placeholder: "например, 80",
      },
      {
        name: "Aw_mm2",
        label: "Площадь среза Aw",
        unit: "мм²",
        min: 1e-9,
        placeholder: "например, 900",
      },
    ],
    calculate(values) {
      const V = kN_to_N(values.V_kN);
      const Aw = values.Aw_mm2;
      const tau = V / Aw;
      return {
        result: { label: "τ", value: round(tau), unit: "МПа" },
        steps: [
          { label: "V", value: round(V), unit: "Н" },
          { label: "Aw", value: round(Aw), unit: "мм²" },
        ],
      };
    },
  },

  "steel-bending-stress": {
    id: "steel-bending-stress",
    title: "Нормальное напряжение от изгиба (по заданному W)",
    latex: String.raw`\sigma = \dfrac{M}{W}`,
    description:
      "Нейтральная формула: момент M делится на момент сопротивления W (задаётся пользователем).",
    params: [
      {
        name: "M_kNm",
        label: "Изгибающий момент M",
        unit: "кН·м",
        min: 0,
        placeholder: "например, 35",
      },
      {
        name: "W_mm3",
        label: "Момент сопротивления W",
        unit: "мм³",
        min: 1e-9,
        placeholder: "например, 2.5e6",
      },
    ],
    calculate(values) {
      const M = kNm_to_Nmm(values.M_kNm);
      const W = values.W_mm3;
      const sigma = M / W; // N/mm^2
      return {
        result: { label: "σ", value: round(sigma), unit: "МПа" },
        steps: [
          { label: "M", value: round(M), unit: "Н·мм" },
          { label: "W", value: round(W), unit: "мм³" },
        ],
      };
    },
  },

  utilization: {
    id: "utilization",
    title: "Коэффициент использования",
    latex: String.raw`u = \dfrac{\text{demand}}{\text{capacity}}`,
    description:
      "Нейтральная формула: отношение требуемого к допускаемому. Удобно для любых проверок.",
    params: [
      {
        name: "demand",
        label: "Требуемое (demand)",
        unit: "—",
        min: 0,
        placeholder: "например, 120",
      },
      {
        name: "capacity",
        label: "Допускаемое (capacity)",
        unit: "—",
        min: 1e-9,
        placeholder: "например, 150",
      },
    ],
    calculate(values) {
      const u = values.demand / values.capacity;
      return {
        result: { label: "u", value: round(u), unit: "—" },
        steps: [
          { label: "demand", value: round(values.demand), unit: "—" },
          { label: "capacity", value: round(values.capacity), unit: "—" },
        ],
      };
    },
  },

  "rect-area": {
    id: "rect-area",
    title: "Площадь прямоугольника (справочно)",
    latex: String.raw`A = b \cdot t`,
    params: [
      { name: "b_mm", label: "Ширина b", unit: "мм", min: 0, placeholder: "например, 200" },
      { name: "t_mm", label: "Толщина t", unit: "мм", min: 0, placeholder: "например, 10" },
    ],
    calculate(values) {
      const A = values.b_mm * values.t_mm;
      return {
        result: { label: "A", value: round(A), unit: "мм²" },
        steps: [
          { label: "b", value: round(values.b_mm), unit: "мм" },
          { label: "t", value: round(values.t_mm), unit: "мм" },
        ],
      };
    },
  },

  "rect-inertia": {
    id: "rect-inertia",
    title: "Момент инерции прямоугольника (Ix)",
    latex: String.raw`I_x = \dfrac{b\,t^3}{12}`,
    params: [
      { name: "b_mm", label: "Ширина b", unit: "мм", min: 0, placeholder: "например, 200" },
      { name: "t_mm", label: "Высота/толщина t", unit: "мм", min: 0, placeholder: "например, 10" },
    ],
    calculate(values) {
      const Ix = (values.b_mm * values.t_mm ** 3) / 12;
      return {
        result: { label: "Ix", value: round(Ix), unit: "мм⁴" },
        steps: [
          { label: "b", value: round(values.b_mm), unit: "мм" },
          { label: "t", value: round(values.t_mm), unit: "мм" },
        ],
      };
    },
  },

  "rect-section-modulus": {
    id: "rect-section-modulus",
    title: "Момент сопротивления прямоугольника (Wx)",
    latex: String.raw`W_x = \dfrac{b\,t^2}{6}`,
    params: [
      { name: "b_mm", label: "Ширина b", unit: "мм", min: 0, placeholder: "например, 200" },
      { name: "t_mm", label: "Высота t", unit: "мм", min: 0, placeholder: "например, 10" },
    ],
    calculate(values) {
      const Wx = (values.b_mm * values.t_mm ** 2) / 6;
      return {
        result: { label: "Wx", value: round(Wx), unit: "мм³" },
        steps: [
          { label: "b", value: round(values.b_mm), unit: "мм" },
          { label: "t", value: round(values.t_mm), unit: "мм" },
        ],
      };
    },
  },

  "unit-kN-to-N": {
    id: "unit-kN-to-N",
    title: "Перевод: кН → Н",
    latex: String.raw`N = 1000 \cdot N_{kN}`,
    params: [{ name: "N_kN", label: "Сила", unit: "кН", placeholder: "например, 12" }],
    calculate(values) {
      const N = kN_to_N(values.N_kN);
      return {
        result: { label: "N", value: round(N), unit: "Н" },
        steps: [{ label: "N_kN", value: round(values.N_kN), unit: "кН" }],
      };
    },
  },

  "unit-N-to-kN": {
    id: "unit-N-to-kN",
    title: "Перевод: Н → кН",
    latex: String.raw`N_{kN} = \dfrac{N}{1000}`,
    params: [{ name: "N", label: "Сила", unit: "Н", placeholder: "например, 12000" }],
    calculate(values) {
      const kN = N_to_kN(values.N);
      return {
        result: { label: "N_kN", value: round(kN), unit: "кН" },
        steps: [{ label: "N", value: round(values.N), unit: "Н" }],
      };
    },
  },

  "unit-kNm-to-Nmm": {
    id: "unit-kNm-to-Nmm",
    title: "Перевод: кН·м → Н·мм",
    latex: String.raw`M_{N\cdot mm} = 10^6 \cdot M_{kN\cdot m}`,
    params: [{ name: "M_kNm", label: "Момент", unit: "кН·м", placeholder: "например, 3.5" }],
    calculate(values) {
      const M = kNm_to_Nmm(values.M_kNm);
      return {
        result: { label: "M", value: round(M), unit: "Н·мм" },
        steps: [{ label: "M_kNm", value: round(values.M_kNm), unit: "кН·м" }],
      };
    },
  },

  "unit-mm2-to-m2": {
    id: "unit-mm2-to-m2",
    title: "Перевод: мм² → м²",
    latex: String.raw`A_{m^2} = \\dfrac{A_{mm^2}}{10^6}`,
    params: [{ name: "A_mm2", label: "Площадь", unit: "мм²", placeholder: "например, 1500" }],
    calculate(values) {
      const m2 = values.A_mm2 / 1_000_000;
      return {
        result: { label: "A", value: round(m2, 12), unit: "м²" },
        steps: [{ label: "A_mm2", value: round(values.A_mm2), unit: "мм²" }],
      };
    },
  },
};

export function getFormulaBlock(id: string): FormulaBlock | undefined {
  return FORMULA_REGISTRY[id];
}

export function getFormulaBlocks(ids: string[]): FormulaBlock[] {
  return ids.map((id) => FORMULA_REGISTRY[id]).filter(Boolean);
}

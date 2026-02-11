import { DEMO_CALCULATORS } from "@/lib/calculations/demo";

export type SpStatus = "действует" | "проект" | "утратил силу";

export type SpItem = {
  code: string;
  title: string;
  year: number;
  status: SpStatus;
  sourceUrl: string;
};

export type CalculatorLink = {
  slug: string;
  title: string;
};

export type SpClause = {
  id: string;
  title: string;
  summary: string;
  calculators: CalculatorLink[];
  formulaBlockIds?: string[];
};

export type SpDocument = SpItem & {
  clauses: SpClause[];
};

let SP16_CLAUSES_GENERATED: SpClause[] | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SP16_CLAUSES_GENERATED = require("./sp16-clauses.generated").SP16_CLAUSES as SpClause[];
} catch {
  SP16_CLAUSES_GENERATED = null;
}

function isValidSpClauseId(id: string): boolean {
  const parts = id.split(".");
  if (parts.length === 0 || parts.length > 4) return false;
  for (const p of parts) {
    if (!/^[0-9]+$/.test(p)) return false;
    if (p.length > 1 && p.startsWith("0")) return false; // no 0-prefixed segments like 05
    const n = Number(p);
    if (!Number.isFinite(n) || n < 1) return false; // no 0 segments like 1.0
  }
  const top = Number(parts[0]);
  // СП16 section numbering is within a small range.
  if (top < 1 || top > 20) return false;
  return true;
}

function sanitizeGeneratedClauses(clauses: SpClause[]): SpClause[] {
  const seen = new Set<string>();
  const out: SpClause[] = [];
  for (const c of clauses) {
    const id = String(c.id ?? "").trim();
    if (!id) continue;
    if (!isValidSpClauseId(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...c, id });
  }
  return out;
}

const demoRect = DEMO_CALCULATORS["rectangle-area"];

export const SP_DOCUMENTS: SpDocument[] = [
  {
    code: "sp20.13330.2016",
    title: "СП 20.13330.2016 (Нагрузки и воздействия)",
    year: 2016,
    status: "действует",
    sourceUrl: "https://fgiscs.minstroyrf.ru/",
    clauses: [
      {
        id: "1.1",
        title: "1.1 Общие положения",
        summary:
          "Здесь обычно задают термины и рамки применения. В нашем сервисе это место для краткого ориентира: что считаем, какие допущения и где искать расчётные формулы.",
        calculators: [],
      },
      {
        id: "5.2",
        title: "5.2 Упрощённые оценочные расчёты",
        summary:
          "Иногда нужен быстрый прикидочный расчёт (без претензии на полный проект). Этот пункт связываем с простыми калькуляторами, чтобы показать механику.",
        calculators: [{ slug: demoRect.slug, title: demoRect.title }],
      },
      {
        id: "7.4",
        title: "7.4 Комбинации нагрузок",
        summary:
          "Комбинации — это про то, как складывать воздействия с коэффициентами. Здесь пока только заглушка: позже можно добавить калькуляторы по комбинациям.",
        calculators: [],
      },
    ],
  },
  {
    code: "sp63.13330.2018",
    title: "СП 63.13330.2018 (Бетонные и железобетонные конструкции)",
    year: 2018,
    status: "действует",
    sourceUrl: "https://fgiscs.minstroyrf.ru/",
    clauses: [
      {
        id: "2.1",
        title: "2.1 Область применения",
        summary:
          "Коротко: где применимо, какие ограничения и какие исходные параметры важнее всего. Здесь удобно хранить подсказки для входных данных в калькуляторах.",
        calculators: [],
      },
      {
        id: "8.1",
        title: "8.1 Расчёт по предельным состояниям",
        summary:
          "Смысл — проверяем несущую способность и пригодность. В каркасе показываем, как связать пункт со списком калькуляторов.",
        calculators: [{ slug: demoRect.slug, title: demoRect.title }],
      },
      {
        id: "10.3",
        title: "10.3 Конструктивные требования",
        summary:
          "Это про минимальные/максимальные значения, анкеровку, защитный слой и т.п. Позже можно добавить проверки как чек‑лист.",
        calculators: [],
      },
    ],
  },
  {
    code: "sp16.13330.2017",
    title: "СП 16.13330.2017 (Стальные конструкции)",
    year: 2017,
    status: "действует",
    sourceUrl: "https://fgiscs.minstroyrf.ru/",
    clauses: SP16_CLAUSES_GENERATED
      ? sanitizeGeneratedClauses(SP16_CLAUSES_GENERATED)
      : [
      // Каркас для навигации по СП16. Заголовки/summary — неофициальные (без нормативного текста).
      {
        id: "1",
        title: "Раздел 1 — Область применения (каркас)",
        summary: "Раздел для границ применения и общих условий.",
        calculators: [],
      },
      {
        id: "2",
        title: "Раздел 2 — Нормативные ссылки (каркас)",
        summary: "Раздел для перечня ссылочных документов.",
        calculators: [],
      },
      {
        id: "3",
        title: "Раздел 3 — Термины и обозначения (каркас)",
        summary: "Раздел для терминов, обозначений и сокращений.",
        calculators: [],
      },
      {
        id: "4",
        title: "Раздел 4 — Общие положения (каркас)",
        summary: "Раздел для общих принципов расчёта и проектирования.",
        calculators: [],
      },
      {
        id: "4.1",
        title: "4.1 Расчётные модели (каркас)",
        summary: "Краткое пояснение подхода: схема, усилия, исходные допущения.",
        calculators: [],
      },
      {
        id: "4.2",
        title: "4.2 Общие требования к расчёту (каркас)",
        summary: "Проверки по предельным состояниям, сочетания, общая логика.",
        calculators: [],
      },
      {
        id: "5",
        title: "Раздел 5 — Материалы и параметры (каркас)",
        summary: "Раздел для свойств материалов и расчётных параметров.",
        calculators: [],
      },
      {
        id: "5.1",
        title: "5.1 Сталь и характеристики (каркас)",
        summary: "Опорные параметры, единицы, принятые обозначения.",
        calculators: [],
      },
      {
        id: "5.2",
        title: "5.2 Общие параметры элементов (каркас)",
        summary: "Заготовка: геометрия, площади, моменты инерции и т.п.",
        calculators: [],
        formulaBlockIds: ["rect-area", "rect-inertia", "rect-section-modulus"],
      },

      {
        id: "6",
        title: "Раздел 6 — Проверка элементов (каркас)",
        summary: "Раздел для типовых проверок элементов по усилиям/напряжениям.",
        calculators: [],
      },
      {
        id: "6.1",
        title: "6.1 Проверка по осевой силе (демо)",
        summary: "Демо: нейтральные формулы для напряжений и коэффициента использования.",
        calculators: [],
        formulaBlockIds: ["steel-axial-stress", "utilization"],
      },
      {
        id: "6.2",
        title: "6.2 Проверка по поперечной силе (демо)",
        summary: "Демо: касательные напряжения по заданной площади среза.",
        calculators: [],
        formulaBlockIds: ["steel-shear-stress", "utilization"],
      },
      {
        id: "6.3",
        title: "6.3 Проверка по изгибу (демо)",
        summary: "Демо: нормальные напряжения от изгиба по заданному W.",
        calculators: [],
        formulaBlockIds: ["steel-bending-stress", "utilization"],
      },
      {
        id: "6.4",
        title: "6.4 Комбинированные проверки (каркас)",
        summary: "Заготовка под будущие проверки взаимодействия усилий.",
        calculators: [],
      },
      {
        id: "6.5",
        title: "6.5 Дополнительные проверки (каркас)",
        summary: "Заготовка под будущие проверки устойчивости/местной потери и т.п.",
        calculators: [],
      },

      {
        id: "7",
        title: "Раздел 7 — Соединения (каркас)",
        summary: "Каркас для болтовых/сварных/прочих соединений.",
        calculators: [],
      },
      {
        id: "8",
        title: "Раздел 8 — Узлы и детали (каркас)",
        summary: "Каркас для общих требований к узлам.",
        calculators: [],
      },
      {
        id: "9",
        title: "Раздел 9 — Изготовление и монтаж (каркас)",
        summary: "Каркас для требований к изготовлению/монтажу.",
        calculators: [],
      },
      {
        id: "10",
        title: "Раздел 10 — Контроль и приемка (каркас)",
        summary: "Каркас для контроля качества.",
        calculators: [],
      },
      {
        id: "11",
        title: "Раздел 11 — Эксплуатация (каркас)",
        summary: "Каркас для эксплуатации/обслуживания.",
        calculators: [],
      },
      {
        id: "12",
        title: "Раздел 12 — Приложения (каркас)",
        summary: "Каркас для приложений/справочных материалов.",
        calculators: [],
      },
    ],
  },
];

export function getSpDocument(code: string): SpDocument | undefined {
  return SP_DOCUMENTS.find((sp) => sp.code === code);
}

export function getSpList(): SpItem[] {
  return SP_DOCUMENTS.map(({ clauses: _clauses, ...rest }) => rest);
}

export function getCalculatorTitle(code: string, slug: string): string | undefined {
  const sp = getSpDocument(code);
  if (!sp) return undefined;
  for (const clause of sp.clauses) {
    const found = clause.calculators.find((c) => c.slug === slug);
    if (found) return found.title;
  }
  return undefined;
}

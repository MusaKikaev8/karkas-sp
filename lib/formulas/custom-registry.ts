import type { FormulaBlock } from "@/lib/formulas/types";
import type { CustomFormulaRecord } from "@/lib/formulas/custom";
import { customRecordToFormulaBlock } from "@/lib/formulas/custom";

// In-memory cache for custom formulas loaded from the server
let customFormulaCache: Map<string, Map<string, FormulaBlock>> = new Map();

/**
 * Load custom formulas for a specific SP from the server
 * @param spCode - The SP code (e.g., "СП296.1325800.2017")
 * @returns Map of formula id -> FormulaBlock
 */
export async function loadCustomFormulas(
  spCode: string
): Promise<Map<string, FormulaBlock>> {
  // Return cached if available
  if (customFormulaCache.has(spCode)) {
    return customFormulaCache.get(spCode)!;
  }

  try {
    const res = await fetch(
      `/api/custom-formulas?spCode=${encodeURIComponent(spCode)}`
    );
    const json = (await res.json()) as any;

    const formulas = new Map<string, FormulaBlock>();

    if (json.ok && Array.isArray(json.formulas)) {
      json.formulas.forEach((record: CustomFormulaRecord) => {
        // Use formula ID as the block ID
        formulas.set(record.id, customRecordToFormulaBlock(record));
      });
    }

    // Cache the result
    customFormulaCache.set(spCode, formulas);
    return formulas;
  } catch (error) {
    console.error(`Failed to load custom formulas for ${spCode}:`, error);
    return new Map();
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCustomFormulasCache() {
  customFormulaCache.clear();
}

/**
 * Get a custom formula block
 * @param id - The formula ID
 * @param spCode - The SP code (required to load custom formulas)
 * @returns The FormulaBlock or undefined
 */
export async function getCustomFormulaBlock(
  id: string,
  spCode: string
): Promise<FormulaBlock | undefined> {
  const formulas = await loadCustomFormulas(spCode);
  return formulas.get(id);
}

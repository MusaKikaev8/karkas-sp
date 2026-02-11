export function parseFiniteNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  return value;
}

export function validateRequiredNumber(
  label: string,
  raw: string,
  options?: { min?: number; max?: number }
): { value?: number; error?: string } {
  const value = parseFiniteNumber(raw);
  if (value === null) return { error: `Поле «${label}» обязательно и должно быть числом.` };

  if (options?.min !== undefined && value < options.min) {
    return { error: `Поле «${label}» должно быть ≥ ${options.min}.` };
  }
  if (options?.max !== undefined && value > options.max) {
    return { error: `Поле «${label}» должно быть ≤ ${options.max}.` };
  }

  return { value };
}

/**
 * Client-side utility for normalizing SP codes
 * Converts "sp20.13330.2016" (Latin) to "СП20.13330.2016" (Cyrillic)
 */
export function normalizeSpCode(code: string): string {
  if (code.toLowerCase().startsWith('sp')) {
    return 'СП' + code.substring(2);
  }
  return code;
}

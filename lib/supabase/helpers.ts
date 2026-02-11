export function normalizeSpCode(code: string): string {
  // Normalize: if code starts with 'sp' (Latin), replace with 'СП' (Cyrillic)
  // This ensures "sp20.13330.2016" becomes "СП20.13330.2016" to match DB codes
  if (code.toLowerCase().startsWith('sp')) {
    return 'СП' + code.substring(2);
  }
  return code;
}
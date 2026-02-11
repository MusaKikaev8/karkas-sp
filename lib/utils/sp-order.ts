export function compareClauseIds(a: string, b: string): number {
  const aParts = String(a).split(".").map((p) => Number(p));
  const bParts = String(b).split(".").map((p) => Number(p));
  const len = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < len; i += 1) {
    const av = aParts[i] ?? -1;
    const bv = bParts[i] ?? -1;
    if (av === bv) continue;
    return av - bv;
  }

  return aParts.length - bParts.length;
}

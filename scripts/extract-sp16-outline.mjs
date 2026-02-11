import fs from "node:fs";
import path from "node:path";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const PROJECT_ROOT = path.resolve(process.cwd());
const PDF_PATH = path.join(PROJECT_ROOT, "public", "sp16.pdf");
const OVERRIDE_IDS_PATH = path.join(
  PROJECT_ROOT,
  "scripts",
  "sp16-ids.override.txt"
);
const OUT_TS_PATH = path.join(
  PROJECT_ROOT,
  "lib",
  "sp16-clauses.generated.ts"
);

function extractFirstClauseId(title) {
  if (!title) return null;
  const t = String(title);
  // Matches at the start: 1, 2.3, 6.1.4, 4»1, 4,1, 4•1 etc.
  const m = t.match(/^\s*(\d+(?:[\.,»•·\-–—]\d+)*)/);
  if (!m) return null;
  return m[1].replace(/[\.,»•·\-–—]/g, ".").replace(/\.+/g, ".");
}

function flattenOutline(items, out) {
  for (const it of items || []) {
    const id = extractFirstClauseId(it.title);
    if (id) out.push(id);
    if (it.items && it.items.length) flattenOutline(it.items, out);
  }
}

function normalizeSpaces(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function compactLower(s) {
  return normalizeSpaces(s).toLowerCase().replace(/\s+/g, "");
}

function groupTextItemsIntoLines(textContentItems) {
  // pdf.js text items contain transform[5] = y coordinate
  const buckets = new Map();
  for (const item of textContentItems) {
    const str = normalizeSpaces(item.str ?? "");
    if (!str) continue;
    const y = item.transform?.[5];
    const x = item.transform?.[4];
    if (typeof y !== "number" || typeof x !== "number") continue;
    const key = Math.round(y * 2) / 2; // reduce noise
    const arr = buckets.get(key) ?? [];
    arr.push({ x, str });
    buckets.set(key, arr);
  }

  const ys = Array.from(buckets.keys()).sort((a, b) => b - a);
  const lines = [];
  for (const y of ys) {
    const parts = buckets
      .get(y)
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str);
    const line = normalizeSpaces(parts.join(" "));
    if (line) lines.push(line);
  }
  return lines;
}

function extractClauseIdsFromLines(lines) {
  const ids = [];
  for (const line of lines) {
    // TOC lines usually contain a title (letters) and end with a page number.
    const hasLetters = /[A-Za-z\u0400-\u04FF]/.test(line);
    const hasTrailingPage = /\b\d{1,4}\s*$/.test(line);
    if (!hasLetters || !hasTrailingPage) continue;

    // Typical TOC line starts with number like: 6.3 .... 12 (sometimes with odd separators)
    const m = line.match(/^\s*(\d+(?:[\.,»•·\-–—]\d+)*)\b/);
    if (!m) continue;
    const id = m[1].replace(/[\.,»•·\-–—]/g, ".").replace(/\.+/g, ".");
    if (isValidClauseId(id)) ids.push(id);
  }
  return ids;
}

function isValidClauseId(id) {
  if (!id) return false;
  const parts = String(id).split(".");
  if (parts.length === 0 || parts.length > 4) return false;

  for (const p of parts) {
    if (!/^[0-9]+$/.test(p)) return false;
    // no leading zeros ("05"), and no zero segments ("1.0")
    if (p.length > 1 && p.startsWith("0")) return false;
    const n = Number(p);
    if (!Number.isFinite(n) || n < 1) return false;
  }

  const top = Number(parts[0]);
  if (top < 1 || top > 50) return false;
  return true;
}

function uniquePreserveOrder(list) {
  const seen = new Set();
  const out = [];
  for (const x of list) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function loadOverrideIdsIfAny() {
  if (!fs.existsSync(OVERRIDE_IDS_PATH)) return null;
  const raw = fs.readFileSync(OVERRIDE_IDS_PATH, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"))
    .filter((l) => !l.startsWith("//"));
  if (lines.length === 0) return null;

  const ids = [];
  const bad = [];
  for (const line of lines) {
    // allow "6.1 - title" or "6.1\ttitle" too
    const m = line.match(/^(\d+(?:\.\d+)*)/);
    const id = m?.[1] ?? null;
    if (!id || !isValidClauseId(id)) {
      bad.push(line);
      continue;
    }
    ids.push(id);
  }

  if (bad.length) {
    console.warn(
      `Override list contains invalid rows (${bad.length}). First 5:\n` +
        bad.slice(0, 5).join("\n")
    );
  }

  return uniquePreserveOrder(ids).sort(compareClauseIds);
}

function compareClauseIds(a, b) {
  const pa = a.split(".").map((n) => Number(n));
  const pb = b.split(".").map((n) => Number(n));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? -1;
    const db = pb[i] ?? -1;
    if (da !== db) return da - db;
  }
  return 0;
}

function bindingsFor(id) {
  // Keep our demo bindings in section 6 and a couple of geometry helpers.
  if (id === "5.2") return ["rect-area", "rect-inertia", "rect-section-modulus"];
  if (id === "6.1") return ["steel-axial-stress", "utilization"];
  if (id === "6.2") return ["steel-shear-stress", "utilization"];
  if (id === "6.3") return ["steel-bending-stress", "utilization"];
  return undefined;
}

function renderTs(ids) {
  const rows = ids.map((id) => {
    const formulaBlockIds = bindingsFor(id);
    const formulaPart = formulaBlockIds
      ? `\n    formulaBlockIds: ${JSON.stringify(formulaBlockIds)},`
      : "";

    return `  {\n    id: ${JSON.stringify(id)},\n    title: ${JSON.stringify(`${id} (каркас)`)},\n    summary: ${JSON.stringify("")},\n    calculators: [],${formulaPart}\n  },`;
  });

  return `// GENERATED FILE. Do not edit by hand.\n// Source: public/sp16.pdf (outline/bookmarks)\n\nimport type { SpClause } from "./sp-data";\n\nexport const SP16_CLAUSES: SpClause[] = [\n${rows.join("\n")}\n];\n`;
}

async function main() {
  const overrideIds = loadOverrideIdsIfAny();
  if (overrideIds && overrideIds.length) {
    fs.writeFileSync(OUT_TS_PATH, renderTs(overrideIds), "utf8");
    console.log(`Generated: ${path.relative(PROJECT_ROOT, OUT_TS_PATH)}`);
    console.log(`Clauses (override): ${overrideIds.length}`);
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found: ${PDF_PATH}`);
    process.exit(1);
  }

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const outline = await pdf.getOutline();
  const rawIds = [];
  flattenOutline(outline, rawIds);

  let ids = uniquePreserveOrder(rawIds).sort(compareClauseIds);

  // Fallback: parse TOC text if PDF has no bookmarks.
  if (ids.length === 0) {
    let tocStartPage = null;
    const maxProbePages = Math.min(pdf.numPages, 25);

    for (let i = 1; i <= maxProbePages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const lines = groupTextItemsIntoLines(text.items);
      const joined = compactLower(lines.join("\n"));
      const hasTocWord = joined.includes("содержание");

      // Heuristic: TOC pages have many lines starting with a clause number.
      const tocLikeLines = extractClauseIdsFromLines(lines).length;
      const looksLikeToc = tocLikeLines >= 10;

      if (hasTocWord || looksLikeToc) {
        tocStartPage = i;
        break;
      }
    }

    if (tocStartPage != null) {
      const collected = [];
      let emptyStreak = 0;
      for (let i = tocStartPage; i <= Math.min(pdf.numPages, tocStartPage + 15); i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const lines = groupTextItemsIntoLines(text.items);
        const pageIds = extractClauseIdsFromLines(lines);
        if (pageIds.length === 0) {
          emptyStreak++;
        } else {
          emptyStreak = 0;
          collected.push(...pageIds);
        }

        // Stop after a couple of TOC-less pages once we've started collecting.
        if (collected.length > 20 && emptyStreak >= 2) break;
      }

      ids = uniquePreserveOrder(collected).sort(compareClauseIds);
    }
  }

  if (ids.length === 0) {
    console.warn(
      "Could not extract clause IDs: no bookmarks and TOC text was not detected. Try a different PDF or provide a plain-text TOC."
    );
    process.exit(2);
  }

  fs.writeFileSync(OUT_TS_PATH, renderTs(ids), "utf8");
  console.log(`Generated: ${path.relative(PROJECT_ROOT, OUT_TS_PATH)}`);
  console.log(`Clauses: ${ids.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

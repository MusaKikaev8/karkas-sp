import fs from "node:fs";
import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const PDF_PATH = path.join(process.cwd(), "public", "sp16.pdf");

function normalizeSpaces(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function groupTextItemsIntoLines(items) {
  const buckets = new Map();
  for (const item of items) {
    const str = normalizeSpaces(item.str ?? "");
    if (!str) continue;
    const y = item.transform?.[5];
    const x = item.transform?.[4];
    if (typeof y !== "number" || typeof x !== "number") continue;
    const key = Math.round(y * 2) / 2;
    const arr = buckets.get(key) ?? [];
    arr.push({ x, str });
    buckets.set(key, arr);
  }
  const ys = Array.from(buckets.keys()).sort((a, b) => b - a);
  return ys.map((y) =>
    normalizeSpaces(
      buckets
        .get(y)
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(" ")
    )
  );
}

async function main() {
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log("pages:", pdf.numPages);

  for (const pageNo of [1, 2, 3, 4, 5, 6, 7, 8]) {
    if (pageNo > pdf.numPages) break;
    const page = await pdf.getPage(pageNo);
    const text = await page.getTextContent();
    const lines = groupTextItemsIntoLines(text.items).filter(Boolean);
    const nonEmpty = lines.filter((l) => l.length > 0);
    console.log("\n--- page", pageNo, "lines:", nonEmpty.length, "---");
    console.log(nonEmpty.slice(0, 30).join("\n"));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

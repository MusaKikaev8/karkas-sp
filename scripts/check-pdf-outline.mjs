import fs from "node:fs";
import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/check-pdf-outline.mjs <path-to-pdf>");
  process.exit(1);
}

const pdfPath = path.resolve(process.cwd(), input);
if (!fs.existsSync(pdfPath)) {
  console.error("PDF not found:", pdfPath);
  process.exit(1);
}

async function main() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const outline = await pdf.getOutline();
  const outlineCount = Array.isArray(outline) ? outline.length : 0;

  const page = await pdf.getPage(1);
  const text = await page.getTextContent();
  const textItems = text.items || [];

  console.log("PDF:", pdfPath);
  console.log("Pages:", pdf.numPages);
  console.log("Outline entries:", outlineCount);
  console.log("Page 1 text items:", textItems.length);

  if (outlineCount > 0) {
    const sample = outline.slice(0, 10).map((i) => i.title).filter(Boolean);
    console.log("Outline sample:", sample);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

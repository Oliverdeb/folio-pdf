#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import JSZip from "jszip";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "samples");

async function letterPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage(PageSizes.A4);
  const { height } = page.getSize();
  page.drawText("Engagement letter", { x: 72, y: height - 72, size: 16, font: bold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("Dear Colleague", { x: 72, y: height - 110, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("We confirm we are instructed in this matter.", {
    x: 72,
    y: height - 132,
    size: 12,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  return doc.save();
}

async function twoPageLetter() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const p1 = doc.addPage(PageSizes.A4);
  p1.drawText("Engagement letter", { x: 72, y: 770, size: 16, font: bold });
  p1.drawText("Dear Colleague", { x: 72, y: 740, size: 12, font });
  const p2 = doc.addPage(PageSizes.A4);
  p2.drawText("Scope of work", { x: 72, y: 770, size: 16, font: bold });
  p2.drawText("This second page sets the scope.", { x: 72, y: 740, size: 12, font });
  return doc.save();
}

async function feePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage(PageSizes.A4);
  page.drawText("Fee schedule", { x: 72, y: 770, size: 16, font: bold });
  page.drawText("Hourly rates as agreed.", { x: 72, y: 740, size: 12, font });
  return doc.save();
}

async function annexurePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage(PageSizes.A4);
  page.drawText("Annexure A", { x: 72, y: 770, size: 16, font: bold });
  page.drawText("Supporting papers.", { x: 72, y: 740, size: 12, font });
  return doc.save();
}

async function letterDocx() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Engagement letter</w:t></w:r></w:p>
    <w:p><w:r><w:t>Dear Colleague</w:t></w:r></w:p>
    <w:p><w:r><w:t>We confirm we are instructed in this matter.</w:t></w:r></w:p>
  </w:body>
</w:document>`,
  );
  return zip.generateAsync({ type: "uint8array" });
}

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "engagement-letter.pdf"), await twoPageLetter());
await writeFile(join(outDir, "fee-schedule.pdf"), await feePdf());
await writeFile(join(outDir, "annexure-a.pdf"), await annexurePdf());
await writeFile(join(outDir, "engagement-letter.docx"), await letterDocx());
await letterPdf();
console.log("samples written");

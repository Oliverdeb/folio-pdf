import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  extractPages,
  imagesToPdf,
  mergePdfs,
  rearrangePdf,
  splitByChunk,
  splitEachPage,
  stampPdf,
} from "./pdf.ts";

const samples = join(process.cwd(), "public", "samples");

async function load(name: string) {
  return new Uint8Array(await readFile(join(samples, name)));
}

async function pdfPageTexts(bytes: Uint8Array): Promise<string[]> {
  const task = getDocument({
    data: Uint8Array.from(bytes),
    isEvalSupported: false,
    verbosity: 0,
    ...({ disableWorker: true } as object),
  });
  const pdf = await task.promise;
  const texts: string[] = [];
  try {
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
  } finally {
    await task.destroy();
  }
  return texts;
}

test("merge keeps source order and text", async () => {
  const a = await load("engagement-letter.pdf");
  const b = await load("fee-schedule.pdf");
  const merged = await mergePdfs([a, b]);
  const texts = await pdfPageTexts(merged);
  assert.ok(texts[0].includes("Dear Colleague"));
  assert.ok(texts.at(-1)?.includes("Fee schedule"));
});

test("extract page 2 only", async () => {
  const a = await load("engagement-letter.pdf");
  const out = await extractPages(a, "2");
  const texts = await pdfPageTexts(out);
  assert.equal(texts.length, 1);
  assert.ok(texts[0].includes("Scope of work"));
  assert.equal(texts[0].includes("Dear Colleague"), false);
});

test("split each page and by chunks", async () => {
  const a = await load("engagement-letter.pdf");
  const each = await splitEachPage(a);
  assert.equal(each.length, 2);
  const first = await pdfPageTexts(each[0].bytes);
  assert.ok(first[0].includes("Dear Colleague"));
  const chunks = await splitByChunk(a, 1);
  assert.equal(chunks.length, 2);
});

test("rearrange reverse and drop", async () => {
  const a = await load("engagement-letter.pdf");
  const reversed = await rearrangePdf(a, [1, 0]);
  const texts = await pdfPageTexts(reversed);
  assert.ok(texts[0].includes("Scope of work"));
  const dropped = await rearrangePdf(a, [0]);
  assert.equal((await pdfPageTexts(dropped)).length, 1);
});

test("stamp watermark, page numbers, Bates", async () => {
  const a = await load("engagement-letter.pdf");
  const out = await stampPdf(a, {
    watermark: "CONFIDENTIAL",
    pageNumbers: true,
    batesPrefix: "BATES",
    batesStart: 1,
  });
  const texts = await pdfPageTexts(out);
  assert.ok(texts[0].includes("CONFIDENTIAL"));
  assert.ok(texts[0].includes("1 of 2"));
  assert.ok(texts[0].includes("BATES000001"));
});

test("imagesToPdf page sizes", async () => {
  const png = png1x1();
  const a4 = await imagesToPdf([{ bytes: png, mime: "image/png" }], "a4");
  const letter = await imagesToPdf([{ bytes: png, mime: "image/png" }], "letter");
  const original = await imagesToPdf([{ bytes: png, mime: "image/png" }], "original");
  assert.ok(a4.byteLength > 0);
  assert.ok(letter.byteLength > 0);
  assert.ok(original.byteLength > 0);
});

function png1x1() {
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

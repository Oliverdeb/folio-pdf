import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { inspectPdfEncryption, protectPdf, unprotectPdf } from "./pdf-password.ts";
import { PDFDocument } from "pdf-lib";

const letter = join(process.cwd(), "public", "samples", "engagement-letter.pdf");

test("protect then unlock round trip", async () => {
  const src = new Uint8Array(await readFile(letter));
  const locked = await protectPdf(src, "secret-pass");
  const info = await inspectPdfEncryption(locked);
  assert.equal(info.encrypted, true);
  await assert.rejects(() => unprotectPdf(locked, "wrong-pass"));
  const unlocked = await unprotectPdf(locked, "secret-pass");
  const after = await inspectPdfEncryption(unlocked);
  assert.equal(after.encrypted, false);
  const doc = await PDFDocument.load(unlocked);
  assert.equal(doc.isEncrypted, false);
  assert.equal(doc.getPageCount(), 2);
});

test("refuse to lock an already locked file", async () => {
  const src = new Uint8Array(await readFile(letter));
  const locked = await protectPdf(src, "secret-pass");
  await assert.rejects(() => protectPdf(locked, "other-pass"));
});

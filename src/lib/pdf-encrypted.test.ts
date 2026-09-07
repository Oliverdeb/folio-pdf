import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
  isPdfAttachmentName,
  isPdfBytes,
  looksPasswordProtectedPdf,
  unlockedPdfPrompt,
} from "./pdf-encrypted.ts";
import { findUnprotectedPdfAttachments, createMemoryHost } from "./outlook-host.ts";
import { protectPdf } from "./pdf-password.ts";
import { outlookManifestXml } from "./outlook-manifest.ts";

const letter = join(process.cwd(), "public", "samples", "engagement-letter.pdf");

test("sample letter is a PDF and not locked", async () => {
  const bytes = new Uint8Array(await readFile(letter));
  assert.equal(isPdfBytes(bytes), true);
  assert.equal(looksPasswordProtectedPdf(bytes), false);
  assert.equal(isPdfAttachmentName("Annexure A.PDF"), true);
  assert.equal(isPdfAttachmentName("notes.docx"), false);
});

test("locked PDF is detected without pdf-lib", async () => {
  const src = new Uint8Array(await readFile(letter));
  const locked = await protectPdf(src, "secret-pass");
  assert.equal(looksPasswordProtectedPdf(locked), true);
});

test("prompt copy names the file", () => {
  assert.match(unlockedPdfPrompt(["fee-schedule.pdf"]), /fee-schedule\.pdf/);
  assert.match(unlockedPdfPrompt(["a.pdf", "b.pdf"]), /2 PDFs/);
});

test("memory host finds only unlocked PDFs", async () => {
  const src = new Uint8Array(await readFile(letter));
  const locked = await protectPdf(src, "secret-pass");
  const host = createMemoryHost([
    { id: "1", name: "open.pdf", isInline: false, bytes: src },
    { id: "2", name: "locked.pdf", isInline: false, bytes: locked },
    { id: "3", name: "photo.png", isInline: false, bytes: new Uint8Array([1, 2, 3]) },
  ]);
  const found = await findUnprotectedPdfAttachments(host);
  assert.deepEqual(
    found.map((a) => a.name),
    ["open.pdf"],
  );
});

test("manifest asks on attach and on send", () => {
  const xml = outlookManifestXml("https://folio.example");
  assert.match(xml, /OnMessageAttachmentsChanged/);
  assert.match(xml, /OnMessageSend/);
  assert.match(xml, /SendMode="PromptUser"/);
  assert.match(xml, /https:\/\/folio\.example\/outlook\/commands\.js/);
  assert.match(xml, /https:\/\/folio\.example\/outlook\/pane/);
  assert.match(xml, /ReadWriteItem/);
});

test("event runtime associates attach and send handlers", async () => {
  const js = await readFile(join(process.cwd(), "public", "outlook", "commands.js"), "utf8");
  assert.match(js, /onMessageAttachmentsChangedHandler/);
  assert.match(js, /onMessageSendHandler/);
  assert.match(js, /Office\.actions\.associate/);
  assert.match(js, /looksEncryptedPdf/);
  assert.equal(js.includes("import "), false);
});

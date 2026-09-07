import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import mammoth from "mammoth";

test("sample letter docx contains Dear Colleague", async () => {
  const bytes = await readFile(join(process.cwd(), "public", "samples", "engagement-letter.docx"));
  const { value } = await mammoth.convertToHtml({ buffer: bytes });
  assert.match(value, /Dear Colleague/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { compressPdf } from "./pdf-compress.ts";
import { savingsLabel } from "./format.ts";

test("keep-text compress still produces a PDF", async () => {
  const src = new Uint8Array(await readFile(join(process.cwd(), "public", "samples", "engagement-letter.pdf")));
  const out = await compressPdf(src, "text");
  assert.ok(out.byteLength > 100);
  assert.equal(typeof savingsLabel(src.byteLength, out.byteLength), "string");
});

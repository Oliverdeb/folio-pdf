import assert from "node:assert/strict";
import test from "node:test";
import { formatBytes, savingsLabel } from "./format.ts";

test("formatBytes", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2 KB");
});

test("savingsLabel", () => {
  assert.match(savingsLabel(1000, 400), /Saved/);
  assert.equal(savingsLabel(100, 100), "No savings");
});

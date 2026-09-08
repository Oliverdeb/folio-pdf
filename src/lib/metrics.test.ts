import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeGoatSite, goatSite, metricsEnabled, toolEventFromPath, trackPdfDone } from "./metrics.ts";

test("goat site codes are conservative", () => {
  assert.equal(sanitizeGoatSite("Folio-PDF"), "folio-pdf");
  assert.equal(sanitizeGoatSite("https://evil.com"), "");
  assert.equal(sanitizeGoatSite(""), "");
  assert.equal(sanitizeGoatSite("a".repeat(80)), "");
});

test("one event name per PDF tool", () => {
  assert.deepEqual(toolEventFromPath("/protect"), { path: "protect", title: "Password protect" });
  assert.deepEqual(toolEventFromPath("/folio-pdf/merge/"), { path: "merge", title: "Combine PDFs" });
  assert.deepEqual(toolEventFromPath("/outlook/pane"), { path: "outlook", title: "Outlook protect" });
  assert.equal(toolEventFromPath("/"), null);
  assert.equal(toolEventFromPath("/privacy"), null);
});

test("metrics no-op when no site is configured", () => {
  assert.equal(goatSite(), "");
  assert.equal(metricsEnabled(), false);
  assert.doesNotThrow(() => trackPdfDone("/protect"));
});

import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeGoatSite, goatSite, metricsEnabled, trackPage, trackPdfDone } from "./metrics.ts";

test("goat site codes are conservative", () => {
  assert.equal(sanitizeGoatSite("Folio-PDF"), "folio-pdf");
  assert.equal(sanitizeGoatSite("https://evil.com"), "");
  assert.equal(sanitizeGoatSite(""), "");
  assert.equal(sanitizeGoatSite("a".repeat(80)), "");
});

test("metrics no-op when no site is configured", () => {
  assert.equal(goatSite(), "");
  assert.equal(metricsEnabled(), false);
  assert.doesNotThrow(() => trackPage("/protect"));
  assert.doesNotThrow(() => trackPdfDone("/protect"));
});

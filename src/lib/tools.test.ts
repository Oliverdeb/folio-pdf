import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { TOOLS } from "./tools.ts";

test("every tool has a route file and a blurb", () => {
  for (const tool of TOOLS) {
    assert.ok(tool.blurb.length > 10, tool.id);
    assert.ok(tool.detail.length > 10, tool.id);
    const file = join(process.cwd(), "src", "routes", `${tool.id}.tsx`);
    assert.equal(existsSync(file), true, file);
  }
});

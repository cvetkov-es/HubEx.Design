// packages/tokens/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("generated variables.css contains prefixed brand var", () => {
  const css = readFileSync(new URL("./dist/variables.css", import.meta.url), "utf8");
  assert.match(css, /--hx-color-brand:\s*#32B4EB/i);
  assert.match(css, /--hx-font-size-base:\s*13px/);
});

// packages/css/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("bundled css inlines the token variable value", () => {
  const css = readFileSync(new URL("./dist/hubex.css", import.meta.url), "utf8");
  assert.match(css, /\.hx-btn/);
  assert.match(css, /#32B4EB/i); // brand var resolved via postcss-import chain
});

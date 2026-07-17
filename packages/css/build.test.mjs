// packages/css/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

test("bundled css inlines the token variable value", () => {
  const css = readFileSync(new URL("./dist/hubex.css", import.meta.url), "utf8");
  assert.match(css, /\.hx-btn/);
  assert.match(css, /#8dc26f/i); // --hx-color-background-success resolved via postcss-import chain
});

// MANDATORY safeguard (0.2.0): PostCSS does NOT validate var() references — a
// typo or removed token name ships silently (this is exactly how 0.1.0 broke:
// Task 1 re-based the token names and ~21 of the 25 var(--hx-*) references in
// src/index.css kept pointing at removed tokens, and `postcss` built a "green"
// bundle anyway). This test parses src/index.css and packages/tokens' built
// variables.css directly (no PostCSS) and asserts every var(--hx-*) referenced
// in the former is actually defined in the latter.
test("every var(--hx-*) referenced in src/index.css is defined by @cvetkov_es/tokens", () => {
  const srcCss = readFileSync(new URL("./src/index.css", import.meta.url), "utf8");
  const referenced = new Set(
    [...srcCss.matchAll(/var\(\s*(--hx-[a-zA-Z0-9-]+)/g)].map((m) => m[1])
  );

  // Resolve the tokens CSS the same way postcss.config.mjs does, via package
  // exports resolution, so it works regardless of node_modules hoisting.
  const tokensCssPath = require.resolve("@cvetkov_es/tokens/css");
  const tokensCss = readFileSync(tokensCssPath, "utf8");
  const defined = new Set(
    [...tokensCss.matchAll(/(--hx-[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1])
  );

  const unknown = [...referenced].filter((name) => !defined.has(name)).sort();

  assert.deepEqual(
    unknown,
    [],
    `Unknown/removed CSS variables referenced in src/index.css:\n${unknown.join("\n")}`
  );
});

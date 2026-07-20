// packages/tokens/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./dist/variables.css", import.meta.url), "utf8");

test("generated variables.css contains real Figma variable values (docs/design-source/figma-variables.txt)", () => {
  assert.match(css, /--hx-radius-pill:\s*9999px/);
  assert.match(css, /--hx-color-background-success:\s*#8DC26F/);
  assert.match(css, /--hx-color-text-warning:\s*#FF991F/);
  assert.match(css, /--hx-color-background-accent:\s*#32B4EB/);
});

test("corrects the upstream Figma 'backgroundg' typo to 'background'", () => {
  // The Figma source misspells these as color-backgroundg-error/-warning (extra "g");
  // they are folded into the `background` group so consumers can reach them by the
  // expected name. The typo'd spelling must NOT ship.
  assert.match(css, /--hx-color-background-error:\s*#ED1940/);
  assert.match(css, /--hx-color-background-warning:\s*#FF991F/);
  assert.doesNotMatch(css, /--hx-color-backgroundg-/);
});

test("overlay color is emitted as rgba per the plan (color-overlay = #000000 @ alpha 0.50)", () => {
  assert.match(css, /--hx-color-overlay:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)/);
});

test("invented 0.1.0 tokens are gone", () => {
  assert.doesNotMatch(css, /--hx-color-brand-strong/);
  assert.doesNotMatch(css, /--hx-color-success:/);
  assert.doesNotMatch(css, /--hx-color-warning:/);
  assert.doesNotMatch(css, /--hx-radius-sm:/);
  assert.doesNotMatch(css, /--hx-radius-md:/);
  assert.doesNotMatch(css, /--hx-space-3:/);
  assert.doesNotMatch(css, /--hx-space-6:/);
  // omitted per CANT-TELL: no Figma variable for the old border-strong #DADADA
  assert.doesNotMatch(css, /--hx-color-border-strong:/);
});

test("census-derived, non-Figma font tokens are still present", () => {
  assert.match(css, /--hx-font-family:\s*Roboto/);
  assert.match(css, /--hx-font-size-base:\s*13px/);
});

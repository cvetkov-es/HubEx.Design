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

test("official 0.4.0 token scales are present (Task 2)", () => {
  assert.match(css, /--hx-spacing-x2:\s*8px/);
  assert.match(css, /--hx-border-radius-pill:\s*9999px/);
  assert.match(css, /--hx-font-body-regular-size:\s*13px/);
  assert.match(css, /--hx-shadow-base:/);
  assert.doesNotMatch(css, /backgroundg/);
  assert.match(css, /--hx-color-background-error:\s*#ED1940/);
});

test("back-compat aliases resolve to the new canonical values (Task 2)", () => {
  // Style Dictionary's css/variables format (this config runs no `outputReferences`
  // option) resolves token references to their literal value at build time rather
  // than emitting a CSS `var(...)` indirection - so `--hx-radius-pill` ships as the
  // resolved literal `9999px`, not `var(--hx-border-radius-pill)`.
  assert.match(css, /--hx-radius-pill:\s*9999px/);
  assert.match(css, /--hx-size-x2:\s*8px/);
  assert.match(css, /--hx-radius-small:\s*3px/);
  assert.match(css, /--hx-radius-medium:\s*5px/);
  assert.match(css, /--hx-size-x05:\s*2px/);
  assert.match(css, /--hx-size-x1:\s*4px/);
  assert.match(css, /--hx-size-x150percent:\s*6px/);
  assert.match(css, /--hx-size-x250percent:\s*10px/);
  assert.match(css, /--hx-size-x3:\s*12px/);
  assert.match(css, /--hx-font-size-base:\s*13px/);
  assert.match(css, /--hx-font-size-sm:\s*11px/);
  assert.match(css, /--hx-font-size-lg:\s*16px/);
});

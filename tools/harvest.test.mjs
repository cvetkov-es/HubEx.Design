// tools/harvest.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { harvest } from "./harvest.mjs";

test("harvest counts colors, font sizes, families, radii", () => {
  const css = `
    color: #1F1F1F;
    background: #ffffff;
    color: #1f1f1f;
    font-size: 13px;
    font-size: 13px;
    font-family: 'Roboto';
    border-radius: 4px;
  `;
  const r = harvest(css);
  assert.equal(r.colors["#1F1F1F"], 2); // case-normalized to uppercase
  assert.equal(r.colors["#FFFFFF"], 1);
  assert.equal(r.fontSizes["13px"], 2);
  assert.equal(r.fontFamilies["Roboto"], 1);
  assert.equal(r.radii["4px"], 1);
});

// tools/extract-official-tokens.test.mjs
import { test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { extractHubExTokens } from './extract-official-tokens.mjs';

const BUNDLE_PATH = 'tools/.official-ds-ref/package/dist/esm/index.js';
const bundleAvailable = existsSync(BUNDLE_PATH);

if (!bundleAvailable) {
  console.warn(
    `[extract-official-tokens.test.mjs] SKIPPED: ${BUNDLE_PATH} not found. ` +
      'Run `node tools/vendor-official-ds.mjs` first to vendor the official package.'
  );
}

const t = bundleAvailable ? extractHubExTokens(readFileSync(BUNDLE_PATH, 'utf8')) : {};

test.skipIf(!bundleAvailable)('simple color token', () => {
  expect(t['color-text-primary']).toBe('#1F1F1F');
  expect(t['color-text-secondary']).toBe('#777777');   // HubEx, not MyQRcards #999999
});
test.skipIf(!bundleAvailable)('typo backgroundg fixed to background', () => {
  expect(t['color-backgroundg-error']).toBeUndefined();
  expect(t['color-background-error']).toBe('#ED1940');
  expect(t['color-background-warning']).toBe('#FF991F');
});
test.skipIf(!bundleAvailable)('spacing + radius scales', () => {
  expect(t['spacing-x2']).toBe('8px');
  expect(t['unit-base']).toBe('4px');
  expect(t['border-radius-small']).toBe('3px');
  expect(t['border-radius-pill']).toBe('9999px');
});
test.skipIf(!bundleAvailable)('composite typography -> sub-tokens, no garbage', () => {
  expect(t['font-body-regular-size']).toBe('13px');
  expect(t['font-body-regular-weight']).toBe('400');
  expect(t['font-body-regular-line-height']).toBe('16px');
  expect(t['style']).toBeUndefined();
  expect(t['x']).toBeUndefined();
});
test.skipIf(!bundleAvailable)('composite shadow -> single box-shadow value', () => {
  expect(t['shadow-base']).toMatch(/px .*(#|rgba)/);
});

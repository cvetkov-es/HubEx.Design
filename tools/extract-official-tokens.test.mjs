// tools/extract-official-tokens.test.mjs
import { test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { extractHubExTokens, ALIASES, toStyleDictionaryJSON } from './extract-official-tokens.mjs';

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

test.skipIf(!bundleAvailable)('back-compat ALIASES have no collision with extracted flat names', () => {
  for (const name of Object.keys(ALIASES)) {
    expect(t[name], `ALIASES key "${name}" unexpectedly collides with a real extracted token`).toBeUndefined();
  }
});

test.skipIf(!bundleAvailable)('back-compat aliases regroup into the emitted Style Dictionary JSON', () => {
  const sd = toStyleDictionaryJSON({ ...t, ...ALIASES });
  // old --hx-radius-* names, referencing the new border-radius-* scale
  expect(sd.radius.small.value).toBe('{border.radius-small.value}');
  expect(sd.radius.medium.value).toBe('{border.radius-medium.value}');
  expect(sd.radius.pill.value).toBe('{border.radius-pill.value}');
  // old --hx-size-x* names, referencing the new spacing-x* scale
  expect(sd.size.x05.value).toBe('{spacing.x05.value}');
  expect(sd.size.x1.value).toBe('{spacing.x1.value}');
  expect(sd.size.x150percent.value).toBe('{spacing.x150percent.value}');
  expect(sd.size.x2.value).toBe('{spacing.x2.value}');
  expect(sd.size.x250percent.value).toBe('{spacing.x250percent.value}');
  expect(sd.size.x3.value).toBe('{spacing.x3.value}');
  // old --hx-font-size-* names, referencing the new typography sub-tokens
  expect(sd.font['size-base'].value).toBe('{font.body-regular-size.value}');
  expect(sd.font['size-sm'].value).toBe('{font.caption-regular-size.value}');
  expect(sd.font['size-lg'].value).toBe('{font.H3-size.value}');
  // every reference target actually exists in the emitted JSON (no dangling refs)
  for (const ref of Object.values(ALIASES)) {
    const [group, leaf] = ref.slice(1, -7).split('.'); // strip "{" ... ".value}"
    expect(sd[group]?.[leaf], `dangling alias reference ${ref}`).toBeDefined();
  }
});

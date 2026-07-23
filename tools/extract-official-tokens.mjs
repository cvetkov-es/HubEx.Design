// tools/extract-official-tokens.mjs
export function extractHubExTokens(src) {
  const start = src.indexOf('var M={HubEx:');
  if (start === -1) throw new Error('themes object literal not found - source build changed');
  const i = src.indexOf('{', start + 5);
  let depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  // eslint-disable-next-line no-eval
  const M = (0, eval)('(' + src.slice(i, end + 1) + ')');   // trusted package, pure data literal
  const H = M.HubEx;
  const out = {};
  const fix = (name) => name.replace('backgroundg', 'background');

  for (const group of Object.values(H.colors))
    for (const [k, v] of Object.entries(group)) out[fix(k)] = v;
  Object.assign(out, H.fontFamilies);
  for (const [k, v] of Object.entries(H.borderRadius)) out[k] = v;
  for (const [k, v] of Object.entries(H.spaces)) out[k] = v;
  out['unit-base'] = H['unit-base'];
  for (const grp of Object.values(H.sizes)) for (const [k, v] of Object.entries(grp)) out[k] = v;
  for (const [name, obj] of Object.entries(H.borderStyle)) out[`${name}-style`] = obj.style;
  for (const bucket of Object.values(H.typography))
    for (const [fname, spec] of Object.entries(bucket)) {
      out[`${fname}-size`] = spec.fontSize;
      out[`${fname}-weight`] = String(spec.fontWeight);
      out[`${fname}-line-height`] = spec.lineHeight;
      out[`${fname}-family`] = spec.fontFamily;
    }
  const shadowNames = Array.isArray(H.shadows) ? null : Object.keys(H.shadows);
  const shadowArr = Array.isArray(H.shadows) ? H.shadows : Object.values(H.shadows);
  const px = (n) => (/^-?[\d.]+$/.test(String(n)) ? `${n}px` : String(n));
  shadowArr.forEach((s, idx) => {
    const name = s.name || (shadowNames ? shadowNames[idx] : `shadow-${idx}`);
    out[name] = `${px(s.x)} ${px(s.y)} ${px(s.blur)} ${px(s.spread)} ${s.color}`
      .replace(/\s+/g, ' ')
      .trim();
  });
  return out;
}

// Back-compat aliases: old published 0.3.0 `--hx-*` names that no longer exist verbatim
// in the official 0.4.0 token set, mapped to Style Dictionary references pointing at
// the new canonical token. Keyed by the OLD flat name (same convention as everything
// extractHubExTokens produces) so toStyleDictionaryJSON() regroups them the same way
// and reconstructs the exact old `--hx-<name>` CSS variable on every regeneration -
// consumers pinned to the old names keep working without a literal "alias" JSON group
// (which would emit `--hx-alias-*` and defeat the point).
// Reference paths were read off the actual grouping toStyleDictionaryJSON() produces:
// border-radius-* flat names split to group "border" (leaf "radius-*"), spacing-x*
// flat names split to group "spacing" (leaf "x*"), font-<name>-size flat names split
// to group "font" (leaf "<name>-size").
export const ALIASES = {
  'radius-small': '{border.radius-small.value}',
  'radius-medium': '{border.radius-medium.value}',
  'radius-pill': '{border.radius-pill.value}',
  'size-x05': '{spacing.x05.value}',
  'size-x1': '{spacing.x1.value}',
  'size-x150percent': '{spacing.x150percent.value}',
  'size-x2': '{spacing.x2.value}',
  'size-x250percent': '{spacing.x250percent.value}',
  'size-x3': '{spacing.x3.value}',
  'font-size-base': '{font.body-regular-size.value}',
  'font-size-sm': '{font.caption-regular-size.value}',
  'font-size-lg': '{font.H3-size.value}',
};

// Mirror the nesting the existing style-dictionary config (css transformGroup,
// prefix "hx") expects: every emitted `--hx-<name>` variable name is produced by
// joining the JSON path with '-'. Splitting each flat token name on its FIRST
// dash into { category: firstSegment, leaf: remainder } is a lossless, collision-
// free 2-level regrouping (verified against the 0.4.0 vendor dump: no flat name is
// dash-less, and no two names share a (category, remainder) pair) that reconstructs
// the exact original flat name when the CSS transform re-joins the path - unlike a
// naive full-dash split, it never makes one token's leaf also a parent group of
// another (e.g. color-text-accent vs color-text-accent-hover). ALIASES keys are old
// flat names too, so they run through the exact same regrouping.
export function toStyleDictionaryJSON(flat) {
  const sd = {};
  for (const [name, value] of Object.entries(flat)) {
    const dash = name.indexOf('-');
    const cat = dash === -1 ? name : name.slice(0, dash);
    const leaf = dash === -1 ? name : name.slice(dash + 1);
    (sd[cat] ??= {})[leaf] = { value };
  }
  return sd;
}

import { readFileSync, writeFileSync } from 'node:fs';
if (import.meta.url === `file://${process.argv[1]}`) {
  const flat = extractHubExTokens(readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8'));
  const sd = toStyleDictionaryJSON({ ...flat, ...ALIASES });
  writeFileSync('packages/tokens/src/tokens.json', JSON.stringify(sd, null, 2) + '\n');
  console.log('Wrote', Object.keys(flat).length, 'tokens +', Object.keys(ALIASES).length, 'back-compat aliases');
}

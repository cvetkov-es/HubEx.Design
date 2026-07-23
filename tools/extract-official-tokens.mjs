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

import { readFileSync, writeFileSync } from 'node:fs';
if (import.meta.url === `file://${process.argv[1]}`) {
  const flat = extractHubExTokens(readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8'));
  // Mirror the nesting the existing style-dictionary config (css transformGroup,
  // prefix "hx") expects: every emitted `--hx-<name>` variable name is produced by
  // joining the JSON path with '-'. Splitting each flat token name on its FIRST
  // dash into { category: firstSegment, leaf: remainder } is a lossless, collision-
  // free 2-level regrouping (verified against the 0.4.0 vendor dump: no flat name is
  // dash-less, and no two names share a (category, remainder) pair) that reconstructs
  // the exact original flat name when the CSS transform re-joins the path - unlike a
  // naive full-dash split, it never makes one token's leaf also a parent group of
  // another (e.g. color-text-accent vs color-text-accent-hover).
  const sd = {};
  for (const [name, value] of Object.entries(flat)) {
    const dash = name.indexOf('-');
    const cat = dash === -1 ? name : name.slice(0, dash);
    const leaf = dash === -1 ? name : name.slice(dash + 1);
    (sd[cat] ??= {})[leaf] = { value };
  }
  writeFileSync('packages/tokens/src/tokens.json', JSON.stringify(sd, null, 2) + '\n');
  console.log('Wrote', Object.keys(flat).length, 'tokens');
}

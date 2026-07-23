# Rebase Design System onto @hubex/design-system — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the source of truth of `@cvetkov_es/{tokens,css,react}` from hand-decoded Figma to the official `@hubex/design-system` npm package, regenerating tokens and realigning components to the official API — while keeping our lightweight, zero-runtime, tree-shakeable delivery.

**Architecture:** A committed extractor script vendors a pinned version of the official package and reads its `themes.HubEx` token object (without executing the module), transforming it through explicit mapping rules into our Style-Dictionary `tokens.json`. CSS classes and thin React components are realigned to the official token names and component `.d.ts` APIs, porting markup/states from the vendored official source. Our 12 own-only components are kept and marked as unofficial extensions.

**Tech Stack:** pnpm workspaces + Turborepo, Style Dictionary (tokens), PostCSS (css), tsup (react), Vitest, Changesets.

**Granularity note:** Component work is grouped by family into consolidated tasks (fewer review checkpoints). Within a grouped task, implement each listed component in its own TDD cycle + commit, then run the group's tests together before the task's final gate.

## Global Constraints

- Source of truth: `@hubex/design-system@0.4.0`, branch `themes.HubEx` only (verbatim values). Copy this version string wherever the source is referenced.
- Branch: all work on `feat/rebase-on-official-ds`. Never commit to `master`. Merge via PR. Tags are pushed by the USER (harness blocks tag push for the agent).
- `@cvetkov_es/react` bundle hygiene (non-negotiable): `"sideEffects": false`; JS barrel never imports `@cvetkov_es/css`; only named exports, NO `export * as X` namespace re-exports; icons are the Material font (`<span class="material">name</span>`), NO inline SVG sets; ESM-only, no CJS; zero runtime dependencies; `treeshake.test.mjs` must stay green (Button-only bundle small, no react/styled-components pulled).
- Token typo `color-backgroundg-warning/-error` from the source is fixed on our side to `--hx-color-background-warning/-error`; the source keeps the typo (not ours to fix upstream).
- Published token names that already ship (`--hx-radius-*`, `--hx-size-x*`, secondary/ghost button variants) must stay working — add aliases, never hard-remove.
- CSS prefix stays `--hx-` / `.hx-`. React peerDeps stay `react >=18`.
- Every component gets a TDD cycle (failing test first), frequent commits, exact paths.

---

## Reference procedure for component work (Stages 2 & 3)

For EACH component inside a grouped task:

1. **Read the vendored official source:**
   - API: `tools/.official-ds-ref/package/dist/esm/src/components/<Name>/*.d.ts`
   - Compiled styles/markup: grep the component name in `tools/.official-ds-ref/package/dist/esm/index.js` to read real geometry, colors (map to `--hx-*` tokens), states, and DOM structure.
2. **Write the failing test(s)** (Vitest + @testing-library/react), asserting rendered classes/roles/aria and prop→class mapping.
3. **Implement** in our style: a `.hx-<name>*` block in `packages/css/src/index.css` built only from `--hx-*` tokens (no literals), plus a thin React component in `packages/react/src/<Name>/<Name>.tsx` mapping props to classes, rendering no CSS of its own and importing no stylesheet. Match official prop names/types from the `.d.ts`; breaking renames from our current API get an alias where cheap, else are documented.
4. **Run** the CSS `var()`-validator + the component test; both green. **Commit** per component.

The `var()`-validator (`packages/css` test) is the hard gate for every CSS change — 0 dead `var(--hx-*)` references.

---

## Stage 1 — Tokens (foundation, GATE)

### Task 1: Vendor official package + token extractor

**Files:**
- Create: `tools/vendor-official-ds.mjs`, `tools/extract-official-tokens.mjs`, `tools/extract-official-tokens.test.mjs`
- Modify: `.gitignore`; (generated) `packages/tokens/src/tokens.json`
- Create (gitignored, generated): `tools/.official-ds-ref/`

**Interfaces:**
- Produces: `tools/.official-ds-ref/package/` (extracted tarball, reference for all later tasks); `extractHubExTokens(bundleSource: string): object` returning flat `{ tokenName: value }` (names WITHOUT `--hx-` prefix); regenerated `packages/tokens/src/tokens.json`.

- [ ] **Step 1: Vendoring script**

```js
// tools/vendor-official-ds.mjs
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VERSION = '0.4.0';
const root = join(dirname(fileURLToPath(import.meta.url)), '.official-ds-ref');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
execSync(`npm pack @hubex/design-system@${VERSION}`, { cwd: root, stdio: 'inherit' });
const tgz = readdirSync(root).find((f) => f.endsWith('.tgz'));
execSync(`tar -xzf ${tgz}`, { cwd: root, stdio: 'inherit' });
console.log('Vendored @hubex/design-system@' + VERSION + ' into', root);
```
Add `tools/.official-ds-ref/` to `.gitignore`. Run `node tools/vendor-official-ds.mjs` → `tools/.official-ds-ref/package/dist/esm/index.js` exists.

- [ ] **Step 2: Failing extractor test**

```js
// tools/extract-official-tokens.test.mjs
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractHubExTokens } from './extract-official-tokens.mjs';
const t = extractHubExTokens(readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8'));

test('simple color token', () => {
  expect(t['color-text-primary']).toBe('#1F1F1F');
  expect(t['color-text-secondary']).toBe('#777777');   // HubEx, not MyQRcards #999999
});
test('typo backgroundg fixed to background', () => {
  expect(t['color-backgroundg-error']).toBeUndefined();
  expect(t['color-background-error']).toBe('#ED1940');
  expect(t['color-background-warning']).toBe('#FF991F');
});
test('spacing + radius scales', () => {
  expect(t['spacing-x2']).toBe('8px');
  expect(t['unit-base']).toBe('4px');
  expect(t['border-radius-small']).toBe('3px');
  expect(t['border-radius-pill']).toBe('9999px');
});
test('composite typography -> sub-tokens, no garbage', () => {
  expect(t['font-body-regular-size']).toBe('13px');
  expect(t['font-body-regular-weight']).toBe('400');
  expect(t['font-body-regular-line-height']).toBe('16px');
  expect(t['style']).toBeUndefined();
  expect(t['x']).toBeUndefined();
});
test('composite shadow -> single box-shadow value', () => {
  expect(t['shadow-base']).toMatch(/px .*(#|rgba)/);
});
```
Run `pnpm vitest run tools/extract-official-tokens.test.mjs` → FAIL (not exported).

- [ ] **Step 3: Extractor implementation**

```js
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
  shadowArr.forEach((s, idx) => {
    const name = s.name || (shadowNames ? shadowNames[idx] : `shadow-${idx}`);
    out[name] = `${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`.replace(/\s+/g, ' ').trim();
  });
  return out;
}
```
> Implementer: confirm shadow/typography sub-structure by dumping `extractHubExTokens` output against the vendored bundle; adjust the shadow branch if entries differ. The tests pin required output regardless.

Run test → PASS.

- [ ] **Step 4: CLI writer → regenerate tokens.json**

Append:
```js
import { readFileSync, writeFileSync } from 'node:fs';
if (import.meta.url === `file://${process.argv[1]}`) {
  const flat = extractHubExTokens(readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8'));
  const sd = {};
  for (const [name, value] of Object.entries(flat)) {
    const seg = name.split('-');
    const cat = seg[0] === 'color' ? `color/${seg[1]}` : seg[0];
    (sd[cat] ??= {})[name] = { value };
  }
  writeFileSync('packages/tokens/src/tokens.json', JSON.stringify(sd, null, 2) + '\n');
  console.log('Wrote', Object.keys(flat).length, 'tokens');
}
```
> Read the CURRENT `tokens.json` first and mirror its nesting so `style-dictionary` build keeps working; adjust `sd` grouping to match.
Run `node tools/extract-official-tokens.mjs` → ~150+ tokens written.

- [ ] **Step 5: Commit**

```bash
git add tools/ .gitignore packages/tokens/src/tokens.json
git commit -m "feat(tokens): vendor + extract tokens from @hubex/design-system@0.4.0"
```

### Task 2: Token build + aliases + drift guard

**Files:** Modify `packages/tokens/src/tokens.json` (alias group), `packages/tokens/build.test.mjs`
**Interfaces:** Produces built `packages/tokens/dist/variables.css` with new scales + back-compat aliases.

- [ ] **Step 1:** Update `build.test.mjs`:
```js
expect(css).toContain('--hx-spacing-x2: 8px');
expect(css).toContain('--hx-border-radius-pill: 9999px');
expect(css).toContain('--hx-font-body-regular-size: 13px');
expect(css).toContain('--hx-shadow-base:');
expect(css).not.toContain('backgroundg');
expect(css).toContain('--hx-color-background-error: #ED1940');
expect(css).toContain('--hx-radius-pill: var(--hx-border-radius-pill)');
expect(css).toContain('--hx-size-x2: var(--hx-spacing-x2)');
```
- [ ] **Step 2:** `pnpm --filter @cvetkov_es/tokens test` → FAIL.
- [ ] **Step 3:** Add `alias` group to `tokens.json` mapping every old published `--hx-radius-*` / `--hx-size-x*` name (enumerate from committed 0.3.0 `packages/tokens/dist/variables.css`) via Style Dictionary refs, e.g.:
```json
"alias": {
  "radius-small":  { "value": "{border-radius.border-radius-small.value}" },
  "radius-pill":   { "value": "{border-radius.border-radius-pill.value}" },
  "size-x2":  { "value": "{spacing.spacing-x2.value}" }
}
```
Rebuild `pnpm --filter @cvetkov_es/tokens build`.
- [ ] **Step 4:** `pnpm --filter @cvetkov_es/tokens test` → PASS.
- [ ] **Step 5:** Commit `feat(tokens): new scales + back-compat aliases + drift guard`.

### Task 3: Repoint CSS var() refs — GATE

**Files:** Modify `packages/css/src/index.css`
- [ ] **Step 1:** `pnpm --filter @cvetkov_es/css test` → FAIL listing dead `var(--hx-...)` refs (renamed radius/size/color tokens).
- [ ] **Step 2:** Replace each dead ref with the canonical new token (`--hx-border-radius-*`/`--hx-spacing-*`; aliases only for external back-compat). Rebuild `pnpm --filter @cvetkov_es/css build`.
- [ ] **Step 3:** `pnpm --filter @cvetkov_es/css test` → PASS, 0 dead refs.
- [ ] **Step 4:** Commit `fix(css): repoint var() refs to rebased token names`.

**GATE:** Do not start Stage 2 until Tasks 1–3 green.

---

## Stage 2 — Existing components realigned (breaking)

### Task 4: Button

**Files:** `packages/react/src/Button/Button.tsx`, `packages/css/src/index.css`, `Button.test.tsx`
**Official interface:** `variant?: 'primary'|'secondary'|'ghost'|'dashed'` (matches); `size?: 'small'|'medium'` (ours `sm`/`md` → rename + alias); `round?`, `loading?`, `error?`, `fullWidth?`, `disabled?`, `ariaLabel?`, `onClick`, `iconColor?: 'color-icon-accent'|'color-icon-secondary'`; `icon`/`endIcon` → render Material span (NOT inline SVG).
- [ ] **Tests:** `size="medium"`→`.hx-btn`, `size="small"`→`.hx-btn--sm`; legacy `sm` alias works; `round`/`fullWidth`/`loading`/`disabled`→classes/attrs.
- [ ] Implement (alias `sm→small,md→medium`; add round/loading/fullWidth/error/iconColor; Material icons); CSS from `--hx-size-button-*`,`--hx-border-radius-pill`,`--hx-spacing-*`,`--hx-color-*`. react+css tests PASS. Commit `feat(react)!: align Button to official API`.

### Task 5: Input + Select

**Files:** `Input/Input.tsx`, `Select/Select.tsx`, css, tests.
- **Input** interface: `label?, value?, placeholder?, type?: 'text'|'password'|'email'|'tel'|'url'|'search'|'number', disabled?, readOnly?, required?, errorText?, errorId?, allowClear?, textLimit?, fullWidth?, autoFocus?, autoComplete?, onChange/onFocus/onBlur/onKeyDown/onClick, aria*`.
  Tests: `errorText`→error node + `aria-describedby=errorId`; `allowClear` shows clear when value present; `disabled`/`readOnly` reflect; `type` passthrough. CSS `.hx-input*` from `--hx-size-input-m`,`--hx-border-radius-small`,border tokens (hover #999999/focus accent/disabled from vendored source).
- **Select** interface: generic `SelectProps<TOption extends {value,label,disabled?}>`: `options, value?, defaultValue?, onChange(value,option), onQueryChange?, renderOption?, filterBy?, allowClear?, actions?, label?, required?, disabled?`.
  Tests: renders options; select→`onChange(value,option)`; `allowClear` clears; disabled option not selectable; typing filters via default `filterBy`. Implement listbox aria + keyboard, CSS-positioned menu (no floating-ui). `.hx-select*`.
- [ ] Per-component TDD + commit (`feat(react)!: align Input`, `feat(react)!: align Select`). Group gate: react+css tests PASS.

### Task 6: Checkbox + Radio(+RadioGroup) + Toggle

**Files:** `Checkbox/`, `Radio/` (+ new `RadioGroup`), `Toggle/`, css, tests.
- **Checkbox**: `label?, checked?, disabled?, indeterminate?, ariaLabel?, onChange`. Tests: `indeterminate` sets `el.indeterminate`+class; `checked` reflected; `onChange` fires; 18×18 r2.
- **Radio + RadioGroup**: Radio `label?, checked?, name?, value?, disabled?, onChange`; RadioGroup `name, value?, options?, direction?: 'row'|'column', onChange(value,event)`. Tests: group single-select; `direction` class; disabled option.
- **Toggle**: `name, label?, checked?, disabled?, ariaLabel?, onChange(checked,event)` — NOTE boolean-first onChange. Tests: onChange receives boolean first; 24×14.
- [ ] Per-component TDD + commit. Group gate PASS.

### Task 7: Badge + Avatar + Tooltip + Icon + Pagination (display)

**Files:** respective dirs, css, tests.
- **Badge family**: `Badge {children, variant?: 'neutral'|'accent'|'success'|'warning'|'error'}`, `BadgeDot {background?}`, `BadgeCount {value, background?}`, `BadgeTag {type?: 'new'|'beta', tone?: 'light'|'dark'}`, `BadgeShift {status?: 'online'|'offline', size?: 'xl'|'l'|'m'|'s', tooltip*}`. Tests: variant→class; Count pill from `--hx-border-radius-pill`+`--hx-color-background-error`.
- **Avatar + AvatarGroup**: keep hash char-sum%9 → `--hx-color-avatar-<one..nine>-*`; add `AvatarGroup {avatars, size?: 'l'|'m'|'s', maxVisible?}` with "+N" overflow. Tests: hash→stable color class; group truncates at `maxVisible`.
- **Tooltip**: `content: string, placement?` (+ children); CSS-positioned by placement class (no floating-ui); r5 `#353535/#FEFEFE` from tokens. Tests: content on hover/focus; placement class.
- **Icon**: keep Material-font API `{name, size?, color?}` (documented deviation from official `{svg,...}`); size via `--hx-size-icon-*`. Test: Material span + size class.
- **Pagination**: read `.../Pagination/*.d.ts`, match page/onChange props. Tests: page click→onChange(page); active page class.
- [ ] Per-component TDD + commit. Group gate PASS.

---

## Stage 3 — New components (additive)

### Task 8: Text + Link + Loader (presentational)

**Files:** create `Text/`, `Link/`, `Loader/` (+ exports in `index.ts`), css, tests.
- **Text**: variant→typography sub-tokens (`--hx-font-<variant>-size/-weight/-line-height`), variants H0-H3/body/paragraph/tooltip/caption × regular/medium; `as` element. Test: `<Text variant="body-regular">`→`.hx-text--body-regular`.
- **Link**: read `.../Link/*.d.ts` (href, disabled?, onClick, children); color `--hx-color-text-accent`+hover.
- **Loader**: read `.../Loader/*.d.ts` (size s/m/l→`--hx-size-loader-*`, color); CSS keyframe spinner, no JS.
- [ ] Per-component TDD + commit (`feat(react): add Text/Link/Loader`). Group gate PASS.

### Task 9: InputBase + TextArea + Search (input family)

**Files:** create `InputBase/`, `TextArea/`, `Search/`, css, tests.
- **InputBase** (primitive): `value, onChange?, leftIcon?, rightSlot?, rightSlotWidthPx?, errorText?, hideErrorText?, maxLength?, fullWidth?, aria*`. Tests: leftIcon slot, rightSlot render, error.
- **TextArea**: read `.../TextArea/*.d.ts` (value, onChange, rows?, errorText?, disabled?, maxLength?, fullWidth?); geometry like Input.
- **Search**: `value, onChange?, placeholder?, fullWidth?, errorText?, ariaLabel?`; built on InputBase with search-icon leftIcon + clear.
- [ ] Per-component TDD + commit. Group gate PASS.

### Task 10: Info + SegmentedControl + Popover + Dropdown (overlays/controls)

**Files:** create `Info/`, `SegmentedControl/`, `Popover/`, `Dropdown/`, css, tests.
- **Info**: read `.../Info/*.d.ts` (hint icon + tooltip content); reuse Tooltip.
- **SegmentedControl**: read `.../SegmentedControl/*.d.ts` (options, value, onChange); `--hx-size-tab-*`. Tests: segment select→onChange; active class.
- **Popover + Dropdown**: read `.../Popover|Dropdown/*.d.ts`. CSS-positioned placement (no floating-ui) — document no auto-flip. Dropdown = trigger + menu list on Popover. Tests: open/close on trigger; menu item select.
- [ ] Per-component TDD + commit. Group gate PASS.

---

## Stage 4 — Docs & release

### Task 11: Regenerate docs + mark unofficial extensions

**Files:** `llms.txt`, `README.md`, `AGENTS.md`, `playground/src/*`
- [ ] Regenerate `llms.txt` token table verbatim from new `packages/tokens/dist/variables.css`; add "Derived from `@hubex/design-system@0.4.0` (themes.HubEx)."
- [ ] Mark own-only components as **unofficial extensions (not in @hubex/design-system)**: Modal, Table, Tabs, Drawer, Calendar, DatePicker, Chip, Tag, Alert, Menu, Label, Field.
- [ ] Update API docs for realigned/new components; README breaking section (source Figma→official DS, token renames+aliases, Button/Toggle API changes); update `playground`, `pnpm --filter playground build` green.
- [ ] Commit `docs: regenerate llms.txt/README/playground for official-DS rebase`.

### Task 12: Full verification + changeset + PR

**Files:** `.changeset/*.md`
- [ ] Full suite: `pnpm -r test` + `pnpm -r build` green; `treeshake.test.mjs` (Button-only bundle small, no styled-components/react-dom).
- [ ] Consumer smoke: pack tarballs, temp project `pnpm add` tokens+css+react, import Button + one new component, esbuild bundle small, CSS has `--hx-border-radius-pill:9999px`, no `backgroundg`.
- [ ] Changeset: minor bumps (pre-1.0 breaking = minor) tokens/css/react → 0.4.0 line; summarize breaking changes. `pnpm version-packages`, commit, push branch, open PR to master (user merges + pushes tag).
- [ ] Commit `chore: changeset + version for official-DS rebase`.

---

## Self-review notes (author)

- Spec coverage: extractor+mapping+typo fix (T1), new scales+aliases+drift guard (T1–2), css repoint (T3), 11 existing realigned (T4–7), 10 new (T8–10), extensions marked (T11), release/branch/tag-by-user (T12). All spec sections mapped.
- Composite-token risk handled explicitly in T1 (typography→sub-tokens, shadows→box-shadow, borderStyle→-style) with output-pinned tests.
- Consolidated from 25 to 12 tasks by grouping component families; coverage unchanged, each component still gets its own TDD cycle + commit inside its group task.
- Implement-time reads of vendored `.d.ts`/bundle flagged per component with exact reference paths (Pagination, Text, Link, Loader, TextArea, Info, SegmentedControl, Dropdown/Popover), not vague TODOs.

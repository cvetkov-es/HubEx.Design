# Rebase Design System onto @hubex/design-system — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the source of truth of `@cvetkov_es/{tokens,css,react}` from hand-decoded Figma to the official `@hubex/design-system` npm package, regenerating tokens and realigning components to the official API — while keeping our lightweight, zero-runtime, tree-shakeable delivery.

**Architecture:** A committed extractor script vendors a pinned version of the official package and reads its `themes.HubEx` token object (without executing the module), transforming it through explicit mapping rules into our Style-Dictionary `tokens.json`. CSS classes and thin React components are then realigned to the official token names and component `.d.ts` APIs, porting markup/states from the vendored official source. Our 12 own-only components are kept and marked as unofficial extensions.

**Tech Stack:** pnpm workspaces + Turborepo, Style Dictionary (tokens), PostCSS (css), tsup (react), Vitest, Changesets.

## Global Constraints

- Source of truth: `@hubex/design-system@0.4.0`, branch `themes.HubEx` only (verbatim values). Copy this version string wherever the source is referenced.
- Branch: all work on `feat/rebase-on-official-ds`. Never commit to `master`. Merge via PR. Tags are pushed by the USER (harness blocks tag push for the agent).
- `@cvetkov_es/react` bundle hygiene (non-negotiable): `"sideEffects": false`; JS barrel never imports `@cvetkov_es/css`; only named exports, NO `export * as X` namespace re-exports; icons are the Material font (`<span class="material">name</span>`), NO inline SVG sets; ESM-only, no CJS; zero runtime dependencies; `treeshake.test.mjs` must stay green (Button-only bundle small, no react/styled-components pulled).
- Token typo `color-backgroundg-warning/-error` from the source is fixed on our side to `--hx-color-background-warning/-error`; the source keeps the typo (not ours to fix upstream).
- Published token names that already ship (`--hx-radius-*`, `--hx-size-x*`, secondary/ghost button variants) must stay working — add aliases, never hard-remove.
- CSS prefix stays `--hx-` / `.hx-`. React peerDeps stay `react >=18`.
- Every task: TDD (failing test first), frequent commits, exact paths.

---

## Reference procedure for component tasks (Stages 2 & 3)

Every component task follows this same procedure — its specifics (files, interface, tests) are spelled out per task:

1. **Read the vendored official source** for that component:
   - API: `tools/.official-ds-ref/package/dist/esm/src/components/<Name>/*.d.ts`
   - Compiled styles/markup: search `tools/.official-ds-ref/package/dist/esm/index.js` for the component's styled definitions (grep the component name) to read real geometry, colors (as `--hx-*` tokens), states, and DOM structure.
2. **Write the failing test(s)** listed in the task (Vitest + @testing-library/react), asserting rendered classes/roles/aria and prop→class mapping.
3. **Implement** in our style: a `.hx-<name>*` CSS class block in `packages/css/src/index.css` built only from `--hx-*` tokens (no literals), plus a thin React component in `packages/react/src/<Name>/<Name>.tsx` that maps props to class names and renders no CSS of its own. Match the official prop names/types from the `.d.ts` (breaking renames from our current API get an alias where cheap, else documented).
4. **Run** the CSS `var()`-validator and the component test; both green.
5. **Commit.**

The `var()`-validator (`packages/css`) is the hard gate for every CSS change — 0 dead `var(--hx-*)` references.

---

## Stage 0 — Setup

### Task 0: Vendor the pinned official package as a reference

**Files:**
- Create: `tools/vendor-official-ds.mjs`
- Modify: `.gitignore`
- Create (gitignored, generated): `tools/.official-ds-ref/`

**Interfaces:**
- Produces: `tools/.official-ds-ref/package/` — extracted tarball of `@hubex/design-system@0.4.0`, used by the token extractor (Task 1) and every component task as ground-truth reference.

- [ ] **Step 1: Write the vendoring script**

```js
// tools/vendor-official-ds.mjs
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VERSION = '0.4.0';                       // Global Constraint: pinned source version
const root = join(dirname(fileURLToPath(import.meta.url)), '.official-ds-ref');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
execSync(`npm pack @hubex/design-system@${VERSION}`, { cwd: root, stdio: 'inherit' });
const tgz = readdirSync(root).find((f) => f.endsWith('.tgz'));
execSync(`tar -xzf ${tgz}`, { cwd: root, stdio: 'inherit' });
console.log('Vendored @hubex/design-system@' + VERSION + ' into', root);
```

- [ ] **Step 2: Gitignore the reference dir**

Add to `.gitignore`:
```
tools/.official-ds-ref/
```

- [ ] **Step 3: Run it**

Run: `node tools/vendor-official-ds.mjs`
Expected: prints "Vendored @hubex/design-system@0.4.0", and `tools/.official-ds-ref/package/dist/esm/index.js` exists.

- [ ] **Step 4: Commit**

```bash
git add tools/vendor-official-ds.mjs .gitignore
git commit -m "chore: vendor pinned @hubex/design-system@0.4.0 as extraction reference"
```

---

## Stage 1 — Tokens (foundation, GATE)

### Task 1: Token extractor with mapping rules

**Files:**
- Create: `tools/extract-official-tokens.mjs`
- Create: `tools/extract-official-tokens.test.mjs`
- Modify (generated): `packages/tokens/src/tokens.json`

**Interfaces:**
- Consumes: `tools/.official-ds-ref/package/dist/esm/index.js` (from Task 0).
- Produces: `packages/tokens/src/tokens.json` in Style Dictionary format with `--hx-*` names; function `extractHubExTokens(bundleSource: string): object` (exported for tests) returning the flat `{ tokenName: value }` map (names WITHOUT the `--hx-` prefix; Style Dictionary adds it).

- [ ] **Step 1: Write the failing test**

```js
// tools/extract-official-tokens.test.mjs
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractHubExTokens } from './extract-official-tokens.mjs';

const bundle = readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8');
const t = extractHubExTokens(bundle);

test('simple color token, hx-less name -> value', () => {
  expect(t['color-text-primary']).toBe('#1F1F1F');
  expect(t['color-text-secondary']).toBe('#777777');   // HubEx brand, not MyQRcards #999999
});
test('source typo backgroundg is fixed to background', () => {
  expect(t['color-backgroundg-error']).toBeUndefined();
  expect(t['color-background-error']).toBe('#ED1940');
  expect(t['color-background-warning']).toBe('#FF991F');
});
test('spacing + radius scales present with real values', () => {
  expect(t['spacing-x2']).toBe('8px');
  expect(t['unit-base']).toBe('4px');
  expect(t['border-radius-small']).toBe('3px');
  expect(t['border-radius-pill']).toBe('9999px');
});
test('composite typography flattened to sub-tokens (no garbage keys)', () => {
  expect(t['font-body-regular-size']).toBe('13px');
  expect(t['font-body-regular-weight']).toBe('400');
  expect(t['font-body-regular-line-height']).toBe('16px');
  expect(t['style']).toBeUndefined();      // no naive-flatten garbage
  expect(t['x']).toBeUndefined();
});
test('composite shadow flattened to a single box-shadow value', () => {
  expect(t['shadow-base']).toMatch(/px .*(#|rgba)/);   // "<x> <y> <blur> <spread> <color>"
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tools/extract-official-tokens.test.mjs`
Expected: FAIL — `extractHubExTokens` not exported.

- [ ] **Step 3: Write the extractor**

```js
// tools/extract-official-tokens.mjs
// Reads the official themes object literal from the bundle WITHOUT executing the module,
// then maps it into a flat token map with our naming + typo fix + composite rules.

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
  const fix = (name) => name.replace('backgroundg', 'background');   // Global Constraint: typo fix

  // Simple color groups: leaf name is already `color-<group>-<...>`
  for (const group of Object.values(H.colors)) {
    for (const [k, v] of Object.entries(group)) out[fix(k)] = v;
  }
  // fontFamilies
  Object.assign(out, H.fontFamilies);                      // { 'font-family': '...' }
  // borderRadius, spaces, unit-base, sizes -> leaf name verbatim
  for (const [k, v] of Object.entries(H.borderRadius)) out[k] = v;
  for (const [k, v] of Object.entries(H.spaces)) out[k] = v;
  out['unit-base'] = H['unit-base'];
  for (const grp of Object.values(H.sizes)) for (const [k, v] of Object.entries(grp)) out[k] = v;
  // borderStyle: { 'border-solid': { style, type } } -> border-solid-style
  for (const [name, obj] of Object.entries(H.borderStyle)) out[`${name}-style`] = obj.style;
  // typography: nested { head/body: { 'font-X': {fontFamily,fontWeight,fontSize,lineHeight} } }
  for (const bucket of Object.values(H.typography)) {
    for (const [fname, spec] of Object.entries(bucket)) {
      out[`${fname}-size`] = spec.fontSize;
      out[`${fname}-weight`] = String(spec.fontWeight);
      out[`${fname}-line-height`] = spec.lineHeight;
      out[`${fname}-family`] = spec.fontFamily;
    }
  }
  // shadows: array or keyed object of { x,y,blur,spread,color,type,name? }
  const shadowNames = Array.isArray(H.shadows) ? null : Object.keys(H.shadows);
  const shadowArr = Array.isArray(H.shadows) ? H.shadows : Object.values(H.shadows);
  shadowArr.forEach((s, idx) => {
    const name = s.name || (shadowNames ? shadowNames[idx] : `shadow-${idx}`);
    out[name] = `${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`.replace(/\s+/g, ' ').trim();
  });
  return out;
}
```

> NOTE for implementer: the shadow/typography sub-structure must be confirmed against the vendored bundle at implement time — dump `extractHubExTokens` output and inspect. Adjust the shadow branch if entries are named objects rather than a positional array. The test above pins the required output regardless of internal shape.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tools/extract-official-tokens.test.mjs`
Expected: PASS (all cases).

- [ ] **Step 5: Add the writer (CLI entry) and generate tokens.json**

Append to `tools/extract-official-tokens.mjs`:
```js
import { readFileSync, writeFileSync } from 'node:fs';
if (import.meta.url === `file://${process.argv[1]}`) {
  const bundle = readFileSync('tools/.official-ds-ref/package/dist/esm/index.js', 'utf8');
  const flat = extractHubExTokens(bundle);
  // Group into Style Dictionary shape: category from first name segment
  const sd = {};
  for (const [name, value] of Object.entries(flat)) {
    const seg = name.split('-');
    const cat = seg[0] === 'color' ? `color/${seg[1]}` : seg[0];
    (sd[cat] ??= {})[name] = { value };
  }
  writeFileSync('packages/tokens/src/tokens.json', JSON.stringify(sd, null, 2) + '\n');
  console.log('Wrote', Object.keys(flat).length, 'tokens to packages/tokens/src/tokens.json');
}
```
Run: `node tools/extract-official-tokens.mjs`
Expected: prints token count (~150+), `packages/tokens/src/tokens.json` rewritten.

> Confirm the emitted Style-Dictionary shape matches the existing `packages/tokens/` config. Read the CURRENT `tokens.json` first and mirror its nesting/keys so `style-dictionary` build keeps working; adjust the `sd` grouping accordingly.

- [ ] **Step 6: Commit**

```bash
git add tools/extract-official-tokens.mjs tools/extract-official-tokens.test.mjs packages/tokens/src/tokens.json
git commit -m "feat(tokens): extract tokens from @hubex/design-system@0.4.0"
```

### Task 2: Token build + drift guard + alias layer

**Files:**
- Modify: `packages/tokens/src/tokens.json` (add alias tokens)
- Modify: `packages/tokens/build.test.mjs`

**Interfaces:**
- Consumes: generated `tokens.json` (Task 1).
- Produces: built `packages/tokens/dist/variables.css` with all `--hx-*` custom properties + back-compat aliases.

- [ ] **Step 1: Write the failing build test**

Update `packages/tokens/build.test.mjs` to assert:
```js
expect(css).toContain('--hx-spacing-x2: 8px');
expect(css).toContain('--hx-border-radius-pill: 9999px');
expect(css).toContain('--hx-font-body-regular-size: 13px');
expect(css).toContain('--hx-shadow-base:');
expect(css).not.toContain('backgroundg');
expect(css).toContain('--hx-color-background-error: #ED1940');
// back-compat aliases still present (published API)
expect(css).toContain('--hx-radius-pill: var(--hx-border-radius-pill)');
expect(css).toContain('--hx-size-x2: var(--hx-spacing-x2)');
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @cvetkov_es/tokens test`
Expected: FAIL (aliases/new groups absent).

- [ ] **Step 3: Add alias tokens + rebuild**

Add an `alias` group to `tokens.json` mapping every old published `--hx-radius-*` / `--hx-size-x*` name (enumerate them by reading the committed 0.3.0 `packages/tokens/dist/variables.css`) to new ones via Style Dictionary references:
```json
"alias": {
  "radius-small":  { "value": "{border-radius.border-radius-small.value}" },
  "radius-medium": { "value": "{border-radius.border-radius-medium.value}" },
  "radius-pill":   { "value": "{border-radius.border-radius-pill.value}" },
  "size-x05": { "value": "{spacing.spacing-x05.value}" },
  "size-x1":  { "value": "{spacing.spacing-x1.value}" },
  "size-x2":  { "value": "{spacing.spacing-x2.value}" },
  "size-x3":  { "value": "{spacing.spacing-x3.value}" }
}
```
Run: `pnpm --filter @cvetkov_es/tokens build`

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @cvetkov_es/tokens test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): new scales + back-compat aliases + drift guard; rebuild"
```

### Task 3: Fix CSS var() references broken by token rename — GATE

**Files:**
- Modify: `packages/css/src/index.css`

**Interfaces:**
- Consumes: new token names (Task 2).
- Produces: `packages/css/dist/hubex.css` with 0 dead `var()` refs.

- [ ] **Step 1: Run the var() validator to surface dead refs**

Run: `pnpm --filter @cvetkov_es/css test`
Expected: FAIL listing `var(--hx-...)` names that no longer exist (renamed radius/size/color tokens).

- [ ] **Step 2: Update each dead ref**

For each reported dead `var(--hx-OLD)`, replace with the correct new token (prefer canonical `--hx-border-radius-*` / `--hx-spacing-*`; aliases exist only for external back-compat). Edit `packages/css/src/index.css`. Rebuild: `pnpm --filter @cvetkov_es/css build`.

- [ ] **Step 3: Run to verify it passes**

Run: `pnpm --filter @cvetkov_es/css test`
Expected: PASS, 0 dead refs.

- [ ] **Step 4: Commit**

```bash
git add packages/css
git commit -m "fix(css): repoint var() refs to rebased token names"
```

**GATE:** Do not start Stage 2 until Tasks 1–3 are green (tokens+css `pnpm -r test` passes).

---

## Stage 2 — Existing components realigned to official API (breaking)

Follow the "Reference procedure for component tasks" above for each. Each task lists the official interface (from the package `.d.ts`) and required tests. Keep our current prop/variant names working where cheap (alias); document unavoidable breaks in CHANGELOG (Task 25).

### Task 4: Button — align to official ButtonProps

**Files:** Modify `packages/react/src/Button/Button.tsx`, `packages/css/src/index.css`; Test `packages/react/src/Button/Button.test.tsx`

**Official interface (port to this):**
```ts
variant?: 'primary' | 'secondary' | 'ghost' | 'dashed';   // matches ours
size?: 'small' | 'medium';                                 // ours is 'sm'|'md' -> RENAME + alias
round?: boolean; loading?: boolean; error?: string; fullWidth?: boolean;
disabled?: boolean; ariaLabel?: string; onClick: () => void; children?: ReactNode;
icon?, endIcon?: (p: SVGProps) => ReactElement;            // in OUR build: render Material icon span, NOT inline SVG
iconColor?: 'color-icon-accent' | 'color-icon-secondary';
```

- [ ] **Step 1: Failing tests**
```tsx
test('size medium -> base class, small -> hx-btn--sm', () => {
  const { rerender, container } = render(<Button size="medium" onClick={()=>{}}>x</Button>);
  expect(container.querySelector('.hx-btn')).toBeTruthy();
  rerender(<Button size="small" onClick={()=>{}}>x</Button>);
  expect(container.querySelector('.hx-btn--sm')).toBeTruthy();
});
test('legacy size "sm" still works (alias, no break)', () => {
  const { container } = render(<Button size={'sm' as any} onClick={()=>{}}>x</Button>);
  expect(container.querySelector('.hx-btn--sm')).toBeTruthy();
});
test('round, fullWidth, loading, disabled map to classes/attrs', () => {
  const { container } = render(<Button round loading fullWidth disabled onClick={()=>{}}>x</Button>);
  const b = container.querySelector('button')!;
  expect(b.className).toMatch(/hx-btn--round/);
  expect(b.className).toMatch(/hx-btn--full/);
  expect(b).toBeDisabled();
});
```
- [ ] **Step 2:** Run `pnpm --filter @cvetkov_es/react test Button` -> FAIL.
- [ ] **Step 3:** Implement: `size: 'small'|'medium'` with internal alias `sm->small, md->medium`; add `round/loading/fullWidth/error/iconColor`; icons as Material spans. Add `.hx-btn--sm/--round/--full/--loading` CSS from `--hx-size-button-*`, `--hx-border-radius-pill`, `--hx-spacing-*`, `--hx-color-*` (port geometry from vendored Button styles).
- [ ] **Step 4:** Run react+css tests -> PASS.
- [ ] **Step 5:** Commit `feat(react)!: align Button to official API (size small/medium, round/loading/fullWidth)`.

### Task 5: Input — align to official InputProps

**Files:** Modify `Input/Input.tsx`, css; Test `Input.test.tsx`
**Official interface:** `label?, value?, placeholder?, type?: 'text'|'password'|'email'|'tel'|'url'|'search'|'number', disabled?, readOnly?, required?, errorText?, errorId?, allowClear?, textLimit?, fullWidth?, autoFocus?, autoComplete?, onChange/onFocus/onBlur/onKeyDown/onClick, aria*`.
- [ ] **Step 1:** Failing tests: `errorText` renders error node + `aria-describedby=errorId`; `allowClear` shows clear affordance when value present; `disabled`/`readOnly` reflect; `type` passthrough.
- [ ] **Step 2:** Run -> FAIL.
- [ ] **Step 3:** Implement matching interface; CSS `.hx-input*` from `--hx-size-input-m`, `--hx-border-radius-small`, border tokens (port hover `#999999`/focus accent/disabled states from vendored Input).
- [ ] **Step 4:** react+css tests -> PASS.
- [ ] **Step 5:** Commit `feat(react)!: align Input to official API`.

### Task 6: Select — align to official SelectProps

**Files:** Modify `Select/Select.tsx`, css; Test `Select.test.tsx`
**Official interface:** generic `SelectProps<TOption extends {value,label,disabled?}>`: `options, value?, defaultValue?, onChange(value,option), onQueryChange?, renderOption?, filterBy?, allowClear?, actions?, label?, required?, disabled?`.
- [ ] **Step 1:** Failing tests: renders options; selecting calls `onChange(value, option)`; `allowClear` clears; `disabled` option not selectable; typing filters via default `filterBy`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implement (keyboard + listbox aria). No floating-ui — simple absolute-positioned menu. CSS `.hx-select*`.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(react)!: align Select to official API`.

### Task 7: Checkbox — official CheckboxProps

**Files:** `Checkbox/Checkbox.tsx`, css; Test.
**Interface:** `label?, checked?, disabled?, indeterminate?, ariaLabel?, onChange`.
- [ ] Steps 1–5 (TDD): tests `indeterminate` sets `el.indeterminate` + class, `checked` reflected, `onChange` fires; 18×18 r2 geometry from `--hx-*`. Commit `feat(react)!: align Checkbox (add indeterminate)`.

### Task 8: Radio + RadioGroup — official RadioProps/RadioGroupProps

**Files:** `Radio/Radio.tsx` (+ new `RadioGroup`), css; Test.
**Interface:** Radio `label?, checked?, name?, value?, disabled?, onChange`; RadioGroup `name, value?, options?, direction?: 'row'|'column', onChange(value,event)`.
- [ ] Steps 1–5: tests group single-select, `direction` class, option disabled. Commit `feat(react)!: add RadioGroup, align Radio`.

### Task 9: Toggle — official ToggleProps

**Files:** `Toggle/Toggle.tsx`, css; Test.
**Interface:** `name, label?, checked?, disabled?, ariaLabel?, onChange(checked,event)` — NOTE onChange gives `(checked: boolean, event)`, not raw event.
- [ ] Steps 1–5: test `onChange` receives boolean first; 24×14 geometry. Commit `feat(react)!: align Toggle onChange(checked,event)`.

### Task 10: Badge family (Dot/Count/Tag/Shift) — official Badge

**Files:** `Badge/Badge.tsx`, css; Test.
**Interface:** `Badge {children, variant?: 'neutral'|'accent'|'success'|'warning'|'error'}`, `BadgeDot {background?}`, `BadgeCount {value, background?}`, `BadgeTag {type?: 'new'|'beta', tone?: 'light'|'dark'}`, `BadgeShift {status?: 'online'|'offline', size?: 'xl'|'l'|'m'|'s', tooltip*}`.
- [ ] Steps 1–5: tests per subcomponent variant->class; Count pill from `--hx-border-radius-pill` + `--hx-color-background-error`. Commit `feat(react)!: align Badge family (Dot/Count/Tag/Shift)`.

### Task 11: Avatar + AvatarGroup — official Avatar API

**Files:** `Avatar/Avatar.tsx` (+ new `AvatarGroup`), css; Test.
**Interface:** `AvatarGroup {avatars, size?: 'l'|'m'|'s', maxVisible?}`; Avatar color from `--hx-color-avatar-<one..nine>-*`, hash char-sum%9 (already implemented — keep). Add AvatarGroup with `maxVisible` overflow "+N".
- [ ] Steps 1–5: tests hash->color class stable; group truncates at `maxVisible`. Commit `feat(react): add AvatarGroup`.

### Task 12: Tooltip — official TooltipProps

**Files:** `Tooltip/Tooltip.tsx`, css; Test.
**Interface:** `content: string, placement?` (+ children). No floating-ui — CSS-positioned by `placement` class.
- [ ] Steps 1–5: tests content shows on hover/focus; placement class; r5 `#353535/#FEFEFE` from tokens. Commit `feat(react)!: align Tooltip (content/placement)`.

### Task 13: Icon — official Icon API (keep Material font)

**Files:** `Icon/Icon.tsx`, css; Test.
**Interface (official):** `{svg, size, color?, ariaLabel?}` (SVG component). **Our documented deviation:** keep Material-font `<span class="material">name</span>` API (`{name, size?, color?}`) per bundle-hygiene rules; do NOT adopt SVG injection. Test asserts Material span + size via `--hx-size-icon-*`.
- [ ] Steps 1–5. Commit `feat(react): map Icon sizes to --hx-size-icon-*; keep Material-font API`.

### Task 14: Pagination — official Pagination API

**Files:** `Pagination/Pagination.tsx`, css; Test.
**Interface:** read `tools/.official-ds-ref/.../Pagination/*.d.ts` and match page/onChange props.
- [ ] Steps 1–5: tests page click -> onChange(page); active page class. Commit `feat(react)!: align Pagination to official API`.

---

## Stage 3 — New components (additive)

Same reference procedure. No current equivalent; build fresh (CSS class + thin React), zero runtime deps.

### Task 15: Text — typography component

**Files:** Create `packages/react/src/Text/Text.tsx`, `Text.test.tsx`; css `.hx-text*`; export in `index.ts`.
**Interface:** read `.../Text/*.d.ts`; variant maps to typography sub-tokens (`--hx-font-<variant>-size/-weight/-line-height`). Variants from `typography` (H0-H3, body/paragraph/tooltip/caption × regular/medium).
- [ ] Steps 1–5: test `<Text variant="body-regular">` -> class `hx-text--body-regular`; renders `as` element. Commit `feat(react): add Text`.

### Task 16: Link — official LinkProps

**Files:** Create `Link/Link.tsx`, test; css `.hx-link`.
**Interface:** read `.../Link/*.d.ts` (href, disabled?, onClick, children). Color `--hx-color-text-accent` + hover.
- [ ] Steps 1–5. Commit `feat(react): add Link`.

### Task 17: Loader — official LoaderProps

**Files:** Create `Loader/Loader.tsx`, test; css `.hx-loader`.
**Interface:** `.../Loader/*.d.ts` (size s/m/l -> `--hx-size-loader-*`, color token). CSS keyframe spinner, no JS.
- [ ] Steps 1–5. Commit `feat(react): add Loader`.

### Task 18: TextArea — official TextAreaProps

**Files:** Create `TextArea/TextArea.tsx`, test; css `.hx-textarea`.
**Interface:** `.../TextArea/*.d.ts` (value, onChange, rows?, errorText?, disabled?, maxLength?, fullWidth?). Border/geometry like Input.
- [ ] Steps 1–5. Commit `feat(react): add TextArea`.

### Task 19: InputBase — official InputBaseProps (primitive)

**Files:** Create `InputBase/InputBase.tsx`, test; css `.hx-inputbase`.
**Interface:** `value, onChange?, leftIcon?, rightSlot?, rightSlotWidthPx?, errorText?, hideErrorText?, maxLength?, fullWidth?, aria*`. This is the primitive Input/Select/Search build on.
- [ ] Steps 1–5: tests leftIcon slot, rightSlot render, error. Commit `feat(react): add InputBase primitive`.

### Task 20: Search — official SearchProps

**Files:** Create `Search/Search.tsx`, test; css `.hx-search`.
**Interface:** `value, onChange?, placeholder?, fullWidth?, errorText?, ariaLabel?`. Built on InputBase (Task 19) with search icon leftIcon + clear.
- [ ] Steps 1–5. Commit `feat(react): add Search`.

### Task 21: Info — official InfoProps

**Files:** Create `Info/Info.tsx`, test; css `.hx-info`.
**Interface:** read `.../Info/*.d.ts` (info/hint icon + tooltip content). Reuse Tooltip.
- [ ] Steps 1–5. Commit `feat(react): add Info`.

### Task 22: SegmentedControl — official SegmentedControlProps

**Files:** Create `SegmentedControl/SegmentedControl.tsx`, test; css `.hx-segmented`.
**Interface:** read `.../SegmentedControl/*.d.ts` (options, value, onChange). Uses `--hx-size-tab-*`.
- [ ] Steps 1–5: tests segment select -> onChange; active class. Commit `feat(react): add SegmentedControl`.

### Task 23: Popover + Dropdown — official Popover/Dropdown

**Files:** Create `Popover/Popover.tsx`, `Dropdown/Dropdown.tsx`, tests; css `.hx-popover`, `.hx-dropdown`.
**Interface:** read `.../Popover/*.d.ts` and `.../Dropdown/*.d.ts`. Official uses `@floating-ui/react`; OUR build uses CSS-positioned placement (no floating-ui) — document the limitation (no auto-flip). Dropdown = trigger + menu list built on Popover.
- [ ] Steps 1–5: tests open/close on trigger; menu item select. Commit `feat(react): add Popover + Dropdown (CSS-positioned)`.

---

## Stage 4 — Docs & release

### Task 24: Regenerate docs + mark unofficial extensions

**Files:** Modify `llms.txt`, `README.md`, `AGENTS.md`, `playground/src/*`
- [ ] **Step 1:** Regenerate the `llms.txt` token table verbatim from the new `packages/tokens/dist/variables.css` (every token, grouped). Add line: "Derived from `@hubex/design-system@0.4.0` (themes.HubEx)."
- [ ] **Step 2:** Mark our own-only components as **unofficial extensions (not in @hubex/design-system)**: Modal, Table, Tabs, Drawer, Calendar, DatePicker, Chip, Tag, Alert, Menu, Label, Field.
- [ ] **Step 3:** Update component API docs for realigned/new components (Button size small/medium, Text/Link/Loader/TextArea/InputBase/Search/Info/SegmentedControl/Popover/Dropdown).
- [ ] **Step 4:** README breaking section: source switched Figma->official DS; token renames + aliases; Button/Toggle/etc API changes.
- [ ] **Step 5:** Update `playground` to render new tokens/components; `pnpm --filter playground build` green.
- [ ] **Step 6:** Commit `docs: regenerate llms.txt/README/playground for official-DS rebase`.

### Task 25: Full verification + changeset + PR

**Files:** Create `.changeset/*.md`
- [ ] **Step 1:** Full suite: `pnpm -r test` and `pnpm -r build` -> all green. `treeshake.test.mjs` -> Button-only bundle small, no styled-components/react-dom.
- [ ] **Step 2:** Consumer smoke: pack tarballs, in a temp project `pnpm add` tokens+css+react tarballs, import Button + one new component, esbuild bundle, assert small + CSS has `--hx-border-radius-pill:9999px`, no `backgroundg`.
- [ ] **Step 3:** Write changeset: minor bumps (pre-1.0 breaking = minor) for tokens/css/react -> 0.4.0 line. Summarize breaking token/API changes.
- [ ] **Step 4:** `pnpm version-packages`, commit, push branch `feat/rebase-on-official-ds`, open PR to master. (User merges + pushes tag `vX.Y.Z`.)
- [ ] **Step 5:** Commit `chore: changeset + version for official-DS rebase`.

---

## Self-review notes (author)

- Spec coverage: extractor+mapping (T1), new scales (T1–2), typo fix (T1–2), aliases (T2), css repoint (T3), 11 existing realigned (T4–14), 10 new (T15–23), extensions marked (T24), release/branch/tag-by-user (T25). All spec sections mapped.
- Composite-token risk handled explicitly in T1 (typography->sub-tokens, shadows->box-shadow, borderStyle->-style) with output-pinned tests.
- Uncertainties intentionally deferred to implement-time reads of the vendored `.d.ts`/bundle (Pagination, Text, Link, Loader, Info, SegmentedControl, Dropdown/Popover props) — flagged per task with exact reference paths, not vague TODOs.

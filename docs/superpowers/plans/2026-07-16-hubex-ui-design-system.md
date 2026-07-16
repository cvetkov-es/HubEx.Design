# HubEx UI Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a monorepo publishing `@cvetkov_es/tokens`, `@cvetkov_es/css`, `@cvetkov_es/react` so all HubEx plugins share one centrally-updatable design, consumable by AI via a single `llms.txt` link.

**Architecture:** pnpm-workspaces monorepo, three layered packages (`tokens` ← `css` ← `react`). Tokens are generated from `tokens.json` via Style Dictionary; CSS classes are authored on top of the CSS variables via PostCSS; React components are built with tsup and consume both. Design values come from `Образцы/` (token values) and `figma_reference/*.fig` (component structure). A Vite playground renders every component for visual QA.

**Tech Stack:** pnpm workspaces, Turborepo, Style Dictionary v4, PostCSS + autoprefixer + cssnano, TypeScript, tsup (esbuild), React 18/19 (peerDep), Vitest + @testing-library/react + jsdom, Changesets, Vite (playground).

## Global Constraints

- Package scope: `@cvetkov_es/*`. Package names exactly: `@cvetkov_es/tokens`, `@cvetkov_es/css`, `@cvetkov_es/react`.
- React is a **peerDependency** with range `>=18` in `@cvetkov_es/react` — never a direct/regular dependency. Dev-install React 19 for tests.
- CSS custom property prefix: `--hx-`. CSS class prefix: `.hx-`.
- Package dependency direction is strictly `tokens ← css ← react`. `@cvetkov_es/tokens` has no workspace deps; `@cvetkov_es/css` depends only on `@cvetkov_es/tokens`; `@cvetkov_es/react` depends on both. Never introduce a reverse edge.
- All packages are ESM-only (`"type": "module"`), publish `dist/` only, and expose types.
- Font family stack: `Roboto, -apple-system, "Segoe UI", sans-serif`. Base font-size `13px`, small `11px`, heading `16px`.
- Base palette (verbatim source of truth for token values): text `#1F1F1F`, muted `#777777` / `#999999`, brand `#32B4EB` (+ `#348AEE`, tint `#E8F7FD`), danger `#ED1940`, borders `#EEEEEE` / `#E8E8E8` / `#DADADA`, surfaces `#FFFFFF` / `#FEFEFE` / `#F8F8F8`.
- `.fig` files are NOT parsed by any build step. They are visual/structural reference only, read by the implementer during component tasks.
- Node `>=20`, pnpm `>=9`.

### Bundle-hygiene constraints (from a prior in-house attempt that shipped a 516 KB gzip package)

- **`@cvetkov_es/react` MUST set `"sideEffects": false`** in package.json. Components are pure (they only map props to `.hx-*` class strings) — they have no module-level side effects. This is what lets a consumer's bundler drop unused components.
- **The JS barrel `src/index.ts` MUST NOT import CSS** (no `import "@cvetkov_es/css"`). A JS-level stylesheet import is a module side effect that fights tree-shaking and breaks `sideEffects: false`. Styling ships as the separate `@cvetkov_es/css` package; the consumer imports it once at app entry (`import "@cvetkov_es/css"`). Document this in README/llms.txt.
- **No namespace re-exports** (`export * as Icons from ...`). A namespace object forces bundlers to retain every member. Every component is a named export. This is the specific pattern that made the prior package un-tree-shakeable.
- **No inlined SVG icon sets.** The `Icon` component renders the Material Icons *font* by glyph name (`<span className="material hx-icon">{name}</span>`). No component may import or inline an SVG icon library. (The prior package bundled 1579 SVGs ≈ 540 KB into one file.)
- **`@cvetkov_es/react` is ESM-only — it ships NO CommonJS build.** `tsup` emits `format: ["esm"]` only. This structurally avoids the CJS default-interop crash the prior package hit (`require(...)` → `B.p is not a function`). Consumers use Vite/modern bundlers (ESM), which our React 18/19 plugins already do.
- **Zero runtime dependencies** in `@cvetkov_es/react` (no styled-components, no emotion, no CSS-in-JS). `dependencies` are only the workspace `@cvetkov_es/*` packages; React/React-DOM are peers.
- **tsup config MUST enable `treeshake: true` and `splitting: true`** so the ESM output is code-split and dead-code-eliminable.
- Task 5 includes a **bundle-size guard**: after build, bundle a fixture that imports only `Button`, and assert the output contains no other component and is under a small byte budget — a regression test for the exact failure above.

---

## File Structure

```
hubex-ui/
├─ package.json                 # workspace root, scripts, devDeps
├─ pnpm-workspace.yaml          # packages/* glob
├─ turbo.json                   # build/dev/test pipeline
├─ tsconfig.base.json           # shared TS config
├─ .changeset/config.json       # release config
├─ .npmrc                       # pnpm settings
├─ packages/
│  ├─ tokens/
│  │  ├─ package.json
│  │  ├─ src/tokens.json        # semantic tokens (hand-authored)
│  │  ├─ style-dictionary.config.mjs
│  │  └─ dist/                  # variables.css, tokens.ts, tokens.json (generated)
│  ├─ css/
│  │  ├─ package.json
│  │  ├─ postcss.config.mjs
│  │  ├─ src/index.css          # @hx-* classes on top of tokens vars
│  │  └─ dist/hubex.css         # generated
│  └─ react/
│     ├─ package.json
│     ├─ tsup.config.ts
│     ├─ vitest.config.ts
│     ├─ vitest.setup.ts
│     ├─ src/index.ts           # barrel export
│     ├─ src/<Component>/<Component>.tsx
│     └─ src/<Component>/<Component>.test.tsx
├─ tools/
│  └─ harvest.mjs               # scans source CSS → raw-inventory.json
├─ source/                      # moved from repo root
│  ├─ Образцы/
│  └─ figma_reference/
├─ playground/                  # Vite kitchen-sink (private, not published)
│  ├─ package.json
│  ├─ index.html
│  └─ src/main.tsx
├─ llms.txt                     # AI reference (generated from tokens + component list)
├─ AGENTS.md                    # short AI onboarding for plugin repos
└─ README.md
```

---

### Task 1: Monorepo skeleton

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.npmrc`, `.gitignore`
- Move: repo-root `Образцы/` → `source/Образцы/`, `figma_reference/` → `source/figma_reference/`

**Interfaces:**
- Consumes: nothing.
- Produces: workspace scripts `pnpm build`, `pnpm dev`, `pnpm test`, `pnpm harvest` (wired in later tasks); shared `tsconfig.base.json` extended by every package.

- [ ] **Step 1: Initialize git and move sources**

```bash
cd /home/cvetkov_es/development/HubEx.Design
git init
mkdir -p source
git mv "Образцы" source/ 2>/dev/null || mv "Образцы" source/
git mv figma_reference source/ 2>/dev/null || mv figma_reference source/
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "playground"
```

- [ ] **Step 3: Write `.npmrc`**

```ini
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 4: Write `.gitignore`**

```gitignore
node_modules/
dist/
.turbo/
*.log
raw-inventory.json
```

- [ ] **Step 5: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 6: Write root `package.json`**

```json
{
  "name": "hubex-ui",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20", "pnpm": ">=9" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "harvest": "node tools/harvest.mjs source/Образцы raw-inventory.json"
  },
  "devDependencies": {
    "turbo": "^2.1.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 7: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 8: Install and verify**

Run: `pnpm install`
Expected: completes without error; `node_modules/.bin/turbo` exists.

Run: `pnpm turbo run build --dry=json` (no tasks yet is fine)
Expected: JSON output listing zero or the pipeline config, no crash.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: monorepo skeleton (pnpm workspaces + turbo)"
```

---

### Task 2: Harvest tool

**Files:**
- Create: `tools/harvest.mjs`, `tools/harvest.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: CLI `node tools/harvest.mjs <sourceDir> <outFile>`; exported function `harvest(cssText: string) => { colors: Record<string, number>, fontSizes: Record<string, number>, fontFamilies: Record<string, number>, radii: Record<string, number> }` (keys are the literal value, values are occurrence counts).

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/harvest.test.mjs`
Expected: FAIL — cannot find module export `harvest`.

- [ ] **Step 3: Write minimal implementation**

```js
// tools/harvest.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function tally(regex, text, normalize = (s) => s) {
  const out = {};
  for (const m of text.matchAll(regex)) {
    const key = normalize(m[1]);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

export function harvest(cssText) {
  return {
    colors: tally(/(#[0-9a-fA-F]{6})\b/g, cssText, (s) => s.toUpperCase()),
    fontSizes: tally(/font-size:\s*([0-9.]+px)/g, cssText),
    fontFamilies: tally(/font-family:\s*'([^']+)'/g, cssText),
    radii: tally(/border-radius:\s*([0-9.]+px)/g, cssText),
  };
}

function merge(into, from) {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] || 0) + v;
}

function sortByCount(obj) {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]));
}

function main() {
  const [dir, outFile] = process.argv.slice(2);
  if (!dir || !outFile) {
    console.error("usage: node tools/harvest.mjs <sourceDir> <outFile>");
    process.exit(1);
  }
  const agg = { colors: {}, fontSizes: {}, fontFamilies: {}, radii: {} };
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".css"))) {
    const r = harvest(readFileSync(join(dir, f), "utf8"));
    for (const key of Object.keys(agg)) merge(agg[key], r[key]);
  }
  for (const key of Object.keys(agg)) agg[key] = sortByCount(agg[key]);
  writeFileSync(outFile, JSON.stringify(agg, null, 2));
  console.log(`wrote ${outFile}: ${Object.keys(agg.colors).length} colors, ` +
    `${Object.keys(agg.fontSizes).length} font sizes`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tools/harvest.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run harvest on real sources**

Run: `pnpm harvest`
Expected: writes `raw-inventory.json`; console reports ~25 colors. Open the file and confirm `#1F1F1F`, `#32B4EB`, `#ED1940` appear with high counts.

- [ ] **Step 6: Commit**

```bash
git add tools/ package.json
git commit -m "feat(tools): harvest script extracts token values from CSS dumps"
```

---

### Task 3: `@cvetkov_es/tokens`

**Files:**
- Create: `packages/tokens/package.json`, `packages/tokens/src/tokens.json`, `packages/tokens/style-dictionary.config.mjs`, `packages/tokens/build.test.mjs`

**Interfaces:**
- Consumes: `raw-inventory.json` (read by the human/AI to choose values — not imported).
- Produces:
  - `@cvetkov_es/tokens/css` → `dist/variables.css` defining `:root { --hx-color-text: #1F1F1F; ... }`
  - `@cvetkov_es/tokens` (JS) → `dist/tokens.js` exporting `export const token = { color: { text: "#1F1F1F", ... }, ... }`
  - `@cvetkov_es/tokens/json` → `dist/tokens.json`
  - CSS variable names (stable contract used by `css` and `react`): `--hx-color-text`, `--hx-color-text-muted`, `--hx-color-brand`, `--hx-color-brand-strong`, `--hx-color-brand-tint`, `--hx-color-danger`, `--hx-color-border`, `--hx-color-border-strong`, `--hx-color-surface`, `--hx-color-surface-alt`, `--hx-color-surface-sunken`, `--hx-font-family`, `--hx-font-size-sm`, `--hx-font-size-base`, `--hx-font-size-lg`, `--hx-radius-sm`, `--hx-radius-md`, `--hx-space-1`..`--hx-space-6`.

- [ ] **Step 1: Write `packages/tokens/src/tokens.json`** (Style Dictionary v4 format; values verbatim from Global Constraints)

```json
{
  "color": {
    "text":          { "value": "#1F1F1F" },
    "text-muted":    { "value": "#777777" },
    "text-disabled": { "value": "#999999" },
    "brand":         { "value": "#32B4EB" },
    "brand-strong":  { "value": "#348AEE" },
    "brand-tint":    { "value": "#E8F7FD" },
    "danger":        { "value": "#ED1940" },
    "border":        { "value": "#EEEEEE" },
    "border-strong": { "value": "#DADADA" },
    "surface":       { "value": "#FFFFFF" },
    "surface-alt":   { "value": "#FEFEFE" },
    "surface-sunken":{ "value": "#F8F8F8" }
  },
  "font": {
    "family":    { "value": "Roboto, -apple-system, \"Segoe UI\", sans-serif" },
    "size-sm":   { "value": "11px" },
    "size-base": { "value": "13px" },
    "size-lg":   { "value": "16px" }
  },
  "radius": {
    "sm": { "value": "4px" },
    "md": { "value": "8px" }
  },
  "space": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "5": { "value": "24px" },
    "6": { "value": "32px" }
  }
}
```

- [ ] **Step 2: Write `packages/tokens/style-dictionary.config.mjs`**

```js
export default {
  source: ["src/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "hx",
      buildPath: "dist/",
      files: [{ destination: "variables.css", format: "css/variables" }]
    },
    js: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.json", format: "json/nested" }
      ]
    }
  }
};
```

- [ ] **Step 3: Write `packages/tokens/package.json`**

```json
{
  "name": "@cvetkov_es/tokens",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./dist/tokens.js",
    "./css": "./dist/variables.css",
    "./json": "./dist/tokens.json"
  },
  "files": ["dist"],
  "scripts": { "build": "style-dictionary build --config style-dictionary.config.mjs" },
  "devDependencies": { "style-dictionary": "^4.0.0" }
}
```

- [ ] **Step 4: Write the failing build test**

```js
// packages/tokens/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("generated variables.css contains prefixed brand var", () => {
  const css = readFileSync(new URL("./dist/variables.css", import.meta.url), "utf8");
  assert.match(css, /--hx-color-brand:\s*#32B4EB/i);
  assert.match(css, /--hx-font-size-base:\s*13px/);
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm --filter @cvetkov_es/tokens exec node --test build.test.mjs`
Expected: FAIL — `dist/variables.css` does not exist.

- [ ] **Step 6: Build tokens**

Run: `pnpm --filter @cvetkov_es/tokens install && pnpm --filter @cvetkov_es/tokens build`
Expected: creates `dist/variables.css`, `dist/tokens.js`, `dist/tokens.json`.

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @cvetkov_es/tokens exec node --test build.test.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): @cvetkov_es/tokens via Style Dictionary"
```

---

### Task 4: `@cvetkov_es/css`

**Files:**
- Create: `packages/css/package.json`, `packages/css/postcss.config.mjs`, `packages/css/src/index.css`, `packages/css/build.test.mjs`

**Interfaces:**
- Consumes: `@cvetkov_es/tokens/css` variables (imported at top of `src/index.css`).
- Produces: `@cvetkov_es/css` → `dist/hubex.css` with base classes. Class contract used by `react` and plugins: `.hx-btn`, `.hx-btn--primary`, `.hx-btn--secondary`, `.hx-btn--danger`, `.hx-btn--sm`, `.hx-input`, `.hx-input--invalid`, `.hx-field`, `.hx-label`. (More classes added alongside their components in later tasks.)

- [ ] **Step 1: Write `packages/css/src/index.css`** (seed with the button + input primitives; values reference token vars only)

```css
@import "@cvetkov_es/tokens/css";

:root { color: var(--hx-color-text); font-family: var(--hx-font-family); font-size: var(--hx-font-size-base); }

.hx-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--hx-space-2);
  height: 32px; padding: 0 var(--hx-space-4);
  font-family: var(--hx-font-family); font-size: var(--hx-font-size-base);
  border: 1px solid transparent; border-radius: var(--hx-radius-sm);
  cursor: pointer; user-select: none;
}
.hx-btn--sm { height: 26px; padding: 0 var(--hx-space-3); font-size: var(--hx-font-size-sm); }
.hx-btn--primary { background: var(--hx-color-brand); color: #fff; }
.hx-btn--secondary { background: var(--hx-color-surface); color: var(--hx-color-text); border-color: var(--hx-color-border-strong); }
.hx-btn--danger { background: var(--hx-color-danger); color: #fff; }
.hx-btn[disabled] { opacity: .5; cursor: not-allowed; }

.hx-field { display: flex; flex-direction: column; gap: var(--hx-space-1); }
.hx-label { font-size: var(--hx-font-size-sm); color: var(--hx-color-text-muted); }
.hx-input {
  height: 32px; padding: 0 var(--hx-space-3);
  font-family: var(--hx-font-family); font-size: var(--hx-font-size-base);
  color: var(--hx-color-text);
  background: var(--hx-color-surface);
  border: 1px solid var(--hx-color-border-strong); border-radius: var(--hx-radius-sm);
}
.hx-input:focus { outline: none; border-color: var(--hx-color-brand); }
.hx-input--invalid { border-color: var(--hx-color-danger); }
```

- [ ] **Step 2: Write `packages/css/postcss.config.mjs`**

```js
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssImport from "postcss-import";
export default { plugins: [postcssImport(), autoprefixer(), cssnano({ preset: "default" })] };
```

- [ ] **Step 3: Write `packages/css/package.json`**

```json
{
  "name": "@cvetkov_es/css",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./dist/hubex.css" },
  "files": ["dist"],
  "scripts": { "build": "postcss src/index.css -o dist/hubex.css" },
  "dependencies": { "@cvetkov_es/tokens": "workspace:*" },
  "devDependencies": {
    "postcss": "^8.4.0", "postcss-cli": "^11.0.0", "postcss-import": "^16.1.0",
    "autoprefixer": "^10.4.0", "cssnano": "^7.0.0"
  }
}
```

- [ ] **Step 4: Write the failing build test**

```js
// packages/css/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("bundled css inlines the token variable value", () => {
  const css = readFileSync(new URL("./dist/hubex.css", import.meta.url), "utf8");
  assert.match(css, /\.hx-btn/);
  assert.match(css, /#32B4EB/i); // brand var resolved via postcss-import chain
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm --filter @cvetkov_es/css exec node --test build.test.mjs`
Expected: FAIL — `dist/hubex.css` missing.

- [ ] **Step 6: Build css**

Run: `pnpm install && pnpm --filter @cvetkov_es/css build`
Expected: `dist/hubex.css` created (minified, `.hx-btn` present).

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @cvetkov_es/css exec node --test build.test.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/css
git commit -m "feat(css): @cvetkov_es/css base classes on token variables"
```

---

### Task 5: `@cvetkov_es/react` scaffolding + Button (exemplar component)

This task establishes the component pattern every later component copies: `.tsx` that maps typed props to `.hx-*` classes, colocated Vitest test, barrel export.

**Files:**
- Create: `packages/react/package.json`, `packages/react/tsup.config.ts`, `packages/react/vitest.config.ts`, `packages/react/vitest.setup.ts`, `packages/react/src/index.ts`, `packages/react/src/Button/Button.tsx`, `packages/react/src/Button/Button.test.tsx`

**Interfaces:**
- Consumes: `@cvetkov_es/tokens` only if a component needs raw values in JS. The barrel does NOT import `@cvetkov_es/css` — the stylesheet is a separate, consumer-owned import (see Bundle-hygiene constraints).
- Produces:
  - `@cvetkov_es/react` barrel exporting every component as a **named export** (never a namespace re-export).
  - `Button` component: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "danger"; size?: "md" | "sm"; }`. Renders `<button className="hx-btn hx-btn--{variant} [hx-btn--sm]">`. Default `variant="primary"`, `size="md"`.

- [ ] **Step 1: Write `packages/react/package.json`**

```json
{
  "name": "@cvetkov_es/react",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": false,
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies": { "@cvetkov_es/css": "workspace:*", "@cvetkov_es/tokens": "workspace:*" },
  "devDependencies": {
    "react": "^19.0.0", "react-dom": "^19.0.0",
    "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0",
    "tsup": "^8.0.0", "typescript": "^5.5.0",
    "vitest": "^2.0.0", "jsdom": "^25.0.0",
    "@testing-library/react": "^16.0.0", "@testing-library/jest-dom": "^6.4.0"
  }
}
```

**Why these choices (from a prior in-house package that shipped 516 KB gzip):**
- `"sideEffects": false` — components are pure prop→className maps; this is what lets a consumer drop unused ones.
- `@cvetkov_es/css` stays a runtime `dependency` so it auto-installs for consumers, BUT the JS barrel never `import`s it. The stylesheet is loaded once by the plugin (`import "@cvetkov_es/css"` at app entry). Listing a package as a dependency does not bundle it; only an actual `import` does. This is the exact line the prior package got wrong.

- [ ] **Step 2: Write build/test config**

```ts
// packages/react/tsup.config.ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],          // ESM-only — no CJS build (avoids default-interop crashes)
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,          // code-split ESM so unused components drop
  external: ["react", "react-dom"],
  injectStyle: false        // never inline CSS into the JS
});
```

```ts
// packages/react/vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true }
});
```

```ts
// packages/react/vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the failing test**

```tsx
// packages/react/src/Button/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("renders primary button by default", () => {
  render(<Button>Save</Button>);
  const btn = screen.getByRole("button", { name: "Save" });
  expect(btn).toHaveClass("hx-btn", "hx-btn--primary");
});

test("applies variant and size modifiers", () => {
  render(<Button variant="danger" size="sm">Del</Button>);
  const btn = screen.getByRole("button", { name: "Del" });
  expect(btn).toHaveClass("hx-btn--danger", "hx-btn--sm");
});

test("forwards native props", () => {
  render(<Button disabled>X</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/Button`
Expected: FAIL — cannot resolve `./Button`.

- [ ] **Step 5: Write the implementation**

```tsx
// packages/react/src/Button/Button.tsx
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...rest }, ref) => {
    const cls = ["hx-btn", `hx-btn--${variant}`, size === "sm" && "hx-btn--sm", className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={cls} {...rest} />;
  }
);
Button.displayName = "Button";
```

```ts
// packages/react/src/index.ts
// NOTE: do NOT `import "@cvetkov_es/css"` here — a JS stylesheet import is a module
// side effect that breaks `sideEffects: false` and tree-shaking. The consumer
// imports the stylesheet once at app entry: `import "@cvetkov_es/css"`.
export { Button } from "./Button/Button";
export type { ButtonProps } from "./Button/Button";
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm install && pnpm --filter @cvetkov_es/react exec vitest run src/Button`
Expected: PASS (3 tests).

- [ ] **Step 7: Build the package**

Run: `pnpm --filter @cvetkov_es/react build`
Expected: `dist/index.js` + `dist/index.d.ts` created; no bundled React.

- [ ] **Step 8: Add the bundle-size guard (tree-shaking regression test)**

Create `packages/react/treeshake.test.mjs`. It bundles a fixture that imports only `Button` from the built package with esbuild (react/react-dom external, minified) and asserts the result is tiny and excludes React. This is the regression test for the prior 516 KB failure; later component tasks add `refute` sentinels for other components to prove they drop out.

```js
// packages/react/treeshake.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

async function bundleSize(entryContents) {
  const r = await build({
    stdin: { contents: entryContents, resolveDir: process.cwd(), loader: "js" },
    bundle: true, format: "esm", minify: true, write: false,
    external: ["react", "react-dom", "react/jsx-runtime"],
    absWorkingDir: process.cwd()
  });
  return r.outputFiles[0].text;
}

test("importing only Button yields a tiny, react-free bundle", async () => {
  const out = await bundleSize(`import { Button } from "./dist/index.js"; console.log(Button);`);
  const bytes = Buffer.byteLength(out, "utf8");
  assert.ok(bytes < 8000, `Button-only bundle too large: ${bytes} bytes (expected < 8000)`);
  assert.ok(!/react-dom/.test(out), "react-dom must be external, not bundled");
});
```

Add esbuild to devDependencies and wire the guard into the package `test` script so `pnpm test` runs it:
- `pnpm --filter @cvetkov_es/react add -D esbuild`
- change `@cvetkov_es/react` package.json `test` to: `"test": "vitest run && node --test treeshake.test.mjs"`

Run: `pnpm --filter @cvetkov_es/react test`
Expected: Vitest 3/3 PASS, then the treeshake guard PASSES (Button-only bundle well under 8 KB, no react-dom).

- [ ] **Step 9: Commit**

```bash
git add packages/react
git commit -m "feat(react): scaffold @cvetkov_es/react + Button exemplar + bundle-size guard"
```

---

### Task 6: Form components — Input, Checkbox, Radio, Toggle, Select

Follow the Task 5 pattern exactly (typed props → `.hx-*` classes, colocated test, barrel export). For each component: first add its classes to `packages/css/src/index.css`, then author the `.tsx`, then the test. Extract exact visual values (heights, paddings, colors per state) from `source/figma_reference/*.fig` component nodes and `source/Образцы/*.css`.

**Files (per component):** `packages/react/src/<Name>/<Name>.tsx`, `.../<Name>.test.tsx`; append classes to `packages/css/src/index.css`; add exports to `packages/react/src/index.ts`.

**Interfaces (component contracts to implement):**
- `Input`: `interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { invalid?: boolean }` → `<input className="hx-input [hx-input--invalid]">`, forwardRef.
- `Field`: `{ label?: string; htmlFor?: string; children }` → `<div class="hx-field">` with optional `<label class="hx-label">`. Wraps any control.
- `Checkbox`: `interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string }` → styled `<input type="checkbox" class="hx-checkbox">` (reference variants `Фасеты/Чекбокс/Селект|Не Селект`).
- `Radio`: same shape as Checkbox with `type="radio"`, class `hx-radio`.
- `Toggle`: `interface ToggleProps { checked?: boolean; onChange?: (v: boolean) => void; disabled?: boolean }` → `<button role="switch" aria-checked class="hx-toggle">` (reference `Toggle`).
- `Select`: `interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { invalid?: boolean }` → `<select class="hx-select">` (native select styled; reference `Select`, `Инпуты таблицы/Default`).

- [ ] **Step 1: Extract reference values.** Open the relevant `.fig` component nodes (see Task-2 memory technique for reading `.fig`) and the matching `source/Образцы/*.css`; record height, padding, border, and per-state colors for each control. Note them as comments above each class in `index.css`.

- [ ] **Step 2: For EACH component — write the failing test** (mirror Button.test.tsx: assert base class, a state modifier, and native prop forwarding).

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/<Name>` → Expected: FAIL.

- [ ] **Step 3: For EACH component — add CSS classes** to `packages/css/src/index.css` using only token vars, then rebuild css: `pnpm --filter @cvetkov_es/css build`.

- [ ] **Step 4: For EACH component — write the `.tsx`** per its contract above and add its export to `src/index.ts`.

- [ ] **Step 5: Run the tests** `pnpm --filter @cvetkov_es/react exec vitest run` → Expected: PASS (all form components).

- [ ] **Step 6: Commit** `git add -A && git commit -m "feat(react): form components (Input, Checkbox, Radio, Toggle, Select)"`.

---

### Task 7: Data components — Table (+Head/Row/Cell), Pagination

Same pattern. Table is composed of subcomponents that share styling.

**Interfaces:**
- `Table`: `{ children }` → `<table class="hx-table">`. Subcomponents `Table.Head` (`<thead class="hx-table__head">`), `Table.Row` (`<tr class="hx-table__row">`), `Table.Cell` (`<td class="hx-table__cell">`), `Table.HeadCell` (`<th>`), attached as static properties.
- `Pagination`: `{ page: number; pageCount: number; onPageChange: (page: number) => void }` → `<nav class="hx-pagination">` with prev/next buttons and page numbers; disables prev on page 1, next on last page. Reference `Pagination`.

- [ ] **Step 1: Extract reference values** for table row height, cell padding, header background, border color, and pagination sizing from `.fig` (`Table`, `TableHead`, `TableRow`, `Pagination`) and CSS dumps. Record as comments.

- [ ] **Step 2: Write failing tests** — Table: renders `<table class="hx-table">` and cells via subcomponents; Pagination: prev disabled at page 1, clicking next calls `onPageChange(2)`.

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/Table src/Pagination` → Expected: FAIL.

- [ ] **Step 3: Add CSS classes** (`.hx-table*`, `.hx-pagination*`) to `index.css`; rebuild css.

- [ ] **Step 4: Implement** `Table` (with static subcomponents) and `Pagination`; export from barrel.

- [ ] **Step 5: Run tests** → Expected: PASS.

- [ ] **Step 6: Commit** `git commit -am "feat(react): Table and Pagination"`.

---

### Task 8: Overlay & navigation — Modal, Drawer, Tooltip, Tabs, Menu/Dropdown, Breadcrumbs

Same pattern. Overlays render into a portal.

**Interfaces:**
- `Modal`: `{ open: boolean; onClose: () => void; title?: string; children }` → portal + backdrop `.hx-modal__backdrop` + panel `.hx-modal` (reference `ModalBasic`); closes on backdrop click and Esc.
- `Drawer`: `{ open: boolean; onClose: () => void; side?: "right" | "left"; children }` → portal panel `.hx-drawer` (reference `Drawer`, `Форма заявки Drawer.css`).
- `Tooltip`: `{ content: React.ReactNode; children }` → wraps a trigger, shows `.hx-tooltip` on hover/focus (reference `Tooltip`, `tooltip-arrow`).
- `Tabs`: `{ value: string; onChange: (v: string) => void; items: { value: string; label: string }[] }` → `.hx-tabs` with active item `.hx-tabs__item--active` (reference `Tabs`/`Tab`).
- `Menu`: `{ trigger: React.ReactNode; items: { label: string; onSelect: () => void }[] }` → button that toggles `.hx-menu` list (reference `Menu`, `dropdown menu master`); closes on outside click.
- `Breadcrumbs`: `{ items: { label: string; href?: string }[] }` → `<nav class="hx-breadcrumbs">` (reference `Breadcrumbs`).

- [ ] **Step 1: Extract reference values** (backdrop color/opacity, panel radius/shadow, z-index, tab underline, menu item height) from `.fig` and dumps; record as comments.

- [ ] **Step 2: Write failing tests** — Modal: not rendered when `open=false`, rendered with title when `open=true`, Esc calls `onClose`; Tabs: clicking an item calls `onChange` with its value; Menu: item hidden until trigger click.

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/Modal src/Tabs src/Menu` → Expected: FAIL.

- [ ] **Step 3: Add CSS classes** for all six components; rebuild css.

- [ ] **Step 4: Implement** all six; export from barrel. Use `createPortal` for Modal/Drawer/Menu.

- [ ] **Step 5: Run tests** → Expected: PASS.

- [ ] **Step 6: Commit** `git commit -am "feat(react): overlay & navigation components"`.

---

### Task 9: Indicators — Tag, Chip, Badge, Avatar, Label, Alert, Icon

Same pattern. These are mostly presentational.

**Interfaces:**
- `Tag`: `{ color?: "neutral" | "brand" | "danger"; children }` → `.hx-tag hx-tag--{color}` (reference `Tag`).
- `Chip`: `{ onRemove?: () => void; children }` → `.hx-chip` with optional remove button (reference `chip`, `Chip_local`).
- `Badge`: `{ variant?: "dot" | "count" | "tag"; count?: number; children? }` → `.hx-badge hx-badge--{variant}` (reference `Badge-Dot`/`Badge-Count`/`Badge-Tag`).
- `Avatar`: `{ src?: string; name: string; size?: "sm" | "md" }` → `.hx-avatar`; shows image or initials fallback from `name` (reference `Avatar`, `Avatar-Pin`).
- `Label`: `{ children }` → `.hx-label` inline text label (reference `Label`).
- `Alert`: `{ severity?: "info" | "success" | "warning" | "danger"; title?: string; children }` → `.hx-alert hx-alert--{severity}` (reference `Alert`).
- `Icon`: `{ name: string; size?: number }` → `<span class="material hx-icon">{name}</span>` using the Material Icons font (reference `icons/*`). Document the font requirement in README.

- [ ] **Step 1: Extract reference values** (tag/badge heights, radii, per-severity colors, avatar sizes, alert backgrounds) from `.fig` and dumps; record as comments.

- [ ] **Step 2: Write failing tests** — Badge: `variant="count"` renders the count; Avatar: renders initials when no `src`; Alert: applies `hx-alert--danger` for `severity="danger"`.

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/Badge src/Avatar src/Alert` → Expected: FAIL.

- [ ] **Step 3: Add CSS classes** for all indicators; rebuild css.

- [ ] **Step 4: Implement** all seven; export from barrel.

- [ ] **Step 5: Run tests** → Expected: PASS.

- [ ] **Step 6: Commit** `git commit -am "feat(react): indicator components"`.

---

### Task 10: Date components — DatePicker, Calendar

Same pattern; the most stateful components.

**Interfaces:**
- `Calendar`: `{ value?: Date; onChange: (d: Date) => void; month?: Date }` → `.hx-calendar` grid with `.hx-calendar__head`, `.hx-calendar__day`, active day `.hx-calendar__day--selected` (reference `Calendar`, `CalendarDay`, `CalendarHead`).
- `DatePicker`: `{ value?: Date; onChange: (d: Date) => void; placeholder?: string }` → `Input` trigger that opens `Calendar` in a portal popover (reference `Date-Picker`, `calendar icon`).

- [ ] **Step 1: Extract reference values** (cell size, weekday header style, selected-day color `#32B4EB`) from `.fig`; record as comments.

- [ ] **Step 2: Write failing tests** — Calendar: renders 7 weekday headers and clicking a day calls `onChange` with that date; DatePicker: opens calendar on input click, selecting a day fills the input and closes.

Run: `pnpm --filter @cvetkov_es/react exec vitest run src/Calendar src/DatePicker` → Expected: FAIL.

- [ ] **Step 3: Add CSS classes** (`.hx-calendar*`); rebuild css.

- [ ] **Step 4: Implement** `Calendar` then `DatePicker` (reuse `Input` and a portal popover); export from barrel.

- [ ] **Step 5: Run tests** → Expected: PASS.

- [ ] **Step 6: Commit** `git commit -am "feat(react): Calendar and DatePicker"`.

---

### Task 11: Playground kitchen-sink

**Files:**
- Create: `playground/package.json`, `playground/index.html`, `playground/src/main.tsx`, `playground/vite.config.ts`

**Interfaces:**
- Consumes: `@cvetkov_es/react` (all components).
- Produces: `pnpm dev` serving a single page that renders every component in every variant, for visual comparison against `source/Образцы` screenshots.

- [ ] **Step 1: Write `playground/package.json`**

```json
{
  "name": "playground",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite" },
  "dependencies": { "@cvetkov_es/react": "workspace:*", "react": "^19.0.0", "react-dom": "^19.0.0" },
  "devDependencies": { "vite": "^5.4.0", "@vitejs/plugin-react": "^4.3.0", "typescript": "^5.5.0" }
}
```

- [ ] **Step 2: Write `playground/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });
```

- [ ] **Step 3: Write `playground/index.html`**

```html
<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>HubEx UI</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
```

- [ ] **Step 4: Write `playground/src/main.tsx`** rendering a section per component

```tsx
import { createRoot } from "react-dom/client";
import { Button, Input, Field, Tag, Alert, Badge } from "@cvetkov_es/react";

function App() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 24, maxWidth: 800 }}>
      <section><h2>Button</h2>
        <Button>Primary</Button>{" "}
        <Button variant="secondary">Secondary</Button>{" "}
        <Button variant="danger">Danger</Button>{" "}
        <Button size="sm">Small</Button>
      </section>
      <section><h2>Input</h2>
        <Field label="Email"><Input placeholder="you@hubex" /></Field>
        <Input invalid defaultValue="bad" />
      </section>
      <section><h2>Tag / Badge / Alert</h2>
        <Tag color="brand">Brand</Tag> <Badge variant="count" count={5} />
        <Alert severity="danger" title="Ошибка">Что-то пошло не так</Alert>
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
```

(As later components land, add a section for each — the file is a living gallery.)

- [ ] **Step 5: Run and verify**

Run: `pnpm install && pnpm --filter playground dev`
Expected: Vite serves on localhost; page shows buttons/inputs styled with HubEx colors (brand `#32B4EB`). Compare visually against `source/Образцы`.

- [ ] **Step 6: Commit**

```bash
git add playground
git commit -m "chore: Vite playground kitchen-sink"
```

---

### Task 12: AI consumption — `llms.txt` + `AGENTS.md` + README

**Files:**
- Create: `llms.txt`, `AGENTS.md`, `README.md`

**Interfaces:**
- Consumes: the final component list and token table.
- Produces: the single link an AI is pointed at when building a plugin.

- [ ] **Step 1: Write `llms.txt`** — the AI reference. Include: (a) one-paragraph purpose, (b) install line, (c) the full token table (names + values from Task 3), (d) a component index — for each component: import name, props signature (copied from its task contract), and one usage example, (e) a "Rules" section: use `@cvetkov_es/react` components before hand-rolling; use `--hx-*` vars / `.hx-*` classes for any custom UI; font Roboto, base 13px, brand `#32B4EB`; do NOT hardcode hex values — reference tokens. Include 2 "good vs bad" snippets.

- [ ] **Step 2: Write `AGENTS.md`** — the two-line onboarding a plugin repo pastes into its own `CLAUDE.md`/`AGENTS.md`:

```markdown
# HubEx design system
- Components: install `@cvetkov_es/react`, import from it before hand-rolling UI.
- Rules & tokens: read the design reference at <RAW_URL_TO_llms.txt>.
```

- [ ] **Step 3: Write `README.md`** — install (git-tag install now, GitHub Packages later), the Material Icons font requirement (from Task 9), how to add a component, how to release (Task 13).

- [ ] **Step 4: Verify llms.txt is self-consistent** — every component listed exists in `packages/react/src/index.ts`; every token in the table exists in `packages/tokens/dist/variables.css`.

Run: `node -e "const idx=require('fs').readFileSync('packages/react/src/index.ts','utf8'); console.log(idx.match(/export \{ (\w+)/g))"`
Expected: printed export list matches the component index in `llms.txt`.

- [ ] **Step 5: Commit**

```bash
git add llms.txt AGENTS.md README.md
git commit -m "docs: llms.txt AI reference + AGENTS.md + README"
```

---

### Task 13: Release setup (Changesets) + first tag

**Files:**
- Create: `.changeset/config.json`
- Modify: root `package.json` (add changeset scripts + devDep)

**Interfaces:**
- Consumes: all three publishable packages.
- Produces: `pnpm changeset`, `pnpm version-packages`, `pnpm release`; installable `github:<org>/hubex-ui#v0.1.0` for plugins.

- [ ] **Step 1: Add Changesets**

Run: `pnpm add -Dw @changesets/cli && pnpm changeset init`
Expected: creates `.changeset/config.json`.

- [ ] **Step 2: Set config** — in `.changeset/config.json` set `"access": "public"` (or `"restricted"` for private later) and `"baseBranch": "main"`.

- [ ] **Step 3: Add scripts to root `package.json`**

```json
"version-packages": "changeset version",
"release": "turbo run build && changeset publish"
```

- [ ] **Step 4: Create the first changeset and version**

Run: `pnpm changeset` (choose all three packages, minor) then `pnpm version-packages`
Expected: all three packages bumped to `0.1.0`; `CHANGELOG.md` written per package.

- [ ] **Step 5: Full build + test gate**

Run: `pnpm build && pnpm test`
Expected: all packages build; all Vitest + node tests PASS.

- [ ] **Step 6: Commit and tag**

```bash
git add -A
git commit -m "chore: release v0.1.0"
git tag v0.1.0
```

- [ ] **Step 7: Document plugin install** in README: `pnpm add github:<org>/hubex-ui#v0.1.0` pulls the workspace; note the switch to GitHub Packages + CI publish-on-tag as the future step (out of scope now).

---

## Self-Review

**Spec coverage:**
- Monorepo + 3 packages → Tasks 1, 3, 4, 5. ✓
- React-only components, Vue via tokens+CSS → `@cvetkov_es/css` (Task 4) + `@cvetkov_es/tokens` (Task 3) are framework-agnostic; React in Tasks 5–10. ✓
- Token source = `Образцы/`, harvest safety script → Tasks 2, 3. ✓
- Component source = `.fig` (~30 components) → Tasks 5–10 cover Button, Input, Checkbox, Radio, Toggle, Select, Table(+Head/Row/Cell), Pagination, Modal, Drawer, Tooltip, Tabs, Menu/Dropdown, Breadcrumbs, Tag, Chip, Badge, Avatar, Label, Alert, Icon, Calendar, DatePicker. ✓
- Build stack (pnpm+turbo / Style Dictionary / PostCSS / tsup / Changesets) → Tasks 1, 3, 4, 5, 13. ✓
- Playground instead of Storybook → Task 11. ✓
- AI consumption (llms.txt + package dep) → Task 12. ✓
- Distribution: git-tag now, GitHub Packages + CI later → Task 13. ✓
- `.fig` not in build; harvest not in build → Constraints + Tasks 2, 3. ✓

**Placeholder scan:** Infra tasks (1–5, 11–13) contain complete code and exact commands. Component Tasks 6–10 intentionally specify contracts + a reference-extraction step rather than full per-component source, because exact pixel/color values must be read from `.fig`/CSS dumps at implementation time — the Button exemplar (Task 5) supplies the complete copyable pattern. This is a deliberate, documented decision, not an omission.

**Type consistency:** Class prefix `.hx-`, var prefix `--hx-` used consistently across Tasks 3–10. Token variable names in Task 3 match usages in Task 4 CSS. Component prop interface names in Tasks 5–10 are unique and exported from the single barrel `src/index.ts`. `Field` is defined in Task 6 and reused by DatePicker (Task 10) via `Input`. ✓

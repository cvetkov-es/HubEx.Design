# HubEx UI 0.2.0 — Re-base on real Figma variables

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the invented token set of 0.1.0 with the 100 real named Figma variables (verbatim names + exact values), correct every component's geometry to the `.fig` ground truth, and ship 0.2.0.

**Architecture:** Unchanged (pnpm monorepo, `tokens ← css ← react`, ESM-only, tree-shakeable). Only the token *contents/names* and the CSS/component *values* change.

**Tech Stack:** Unchanged — Style Dictionary, PostCSS, tsup, Vitest, Changesets.

## Why (root cause)

0.1.0 assumed "the .fig has no named variables, so name tokens by frequency analysis of CSS dumps". **False.** The `.fig` contains 100 named Figma variables, consistent across all 4 sections. Values were invented as a result. This release makes Figma the literal source of truth.

## Ground-truth inputs (authoritative — do not re-derive, do not guess)

- **[`docs/design-source/figma-variables.txt`](../../design-source/figma-variables.txt)** — the complete 100-variable dump: verbatim Figma names, exact values, per-section counts, zero conflicts. **This file is the source of truth for Task 1.**
- `docs/design-source/figma-variables.json` — same data as JSON.
- `.superpowers/sdd/fig-button-geometry-report.md` — validated Button geometry.

## Global Constraints

- **Every value MUST come from `figma-variables.txt` or a cited `.fig` extraction. Inventing a value is the exact defect this release fixes. If a needed value has no Figma variable, mark it and ASK — do not guess.**
- Token naming: keep the `--hx-` prefix; after it use the Figma variable's own name verbatim, minus its namespace folder. `colors/text/color-text-primary` → `--hx-color-text-primary`. `radius/border-radius-pill` → `--hx-radius-border-radius-pill` is wrong — strip the redundant leading `radius-`/`color-` duplication only where the variable name already repeats its namespace: use `--hx-radius-pill`, `--hx-radius-small`, `--hx-radius-medium`; `--hx-spacing-x1`, `--hx-spacing-x250percent`; colors keep their full name: `--hx-color-text-primary`, `--hx-color-background-accent`, `--hx-color-backgroundg-error` (**keep the upstream `backgroundg` typo verbatim — it is Figma's real name; do NOT silently "fix" it**).
- CSS class prefix stays `.hx-`. Package names/scope unchanged (`@cvetkov_es/*`).
- Bundle hygiene from 0.1.0 still binds: `sideEffects:false`; barrel is named exports only, never imports CSS; ESM-only; no runtime deps; `/* @__PURE__ */ Object.assign(/* @__PURE__ */ forwardRef(...),{displayName})`; `{...rest}` first; treeshake guard must keep passing.
- No SVG icon sets; `Icon` stays Material-font based.
- 0.2.0 is intentionally BREAKING (token names change; `variant="danger"` removed).

---

### Task 1: Re-base `@cvetkov_es/tokens` on the Figma variables

**Files:** rewrite `packages/tokens/src/tokens.json`; update `packages/tokens/build.test.mjs`.

**Interfaces produced:** the full `--hx-*` variable set consumed by css/react.

- [ ] **Step 1: Read the ground truth.** Read `docs/design-source/figma-variables.txt` in full (100 variables).
- [ ] **Step 2: Rewrite `tokens.json`** so that EVERY one of the 100 variables is present, grouped by its Figma namespace (colors/avatar, colors/background, colors/border, colors/icon, colors/menu, colors/overlay, colors/text, radius, size, spacing). Values exactly as dumped. `color-overlay` is `#000000` at 50% alpha — encode as `rgba(0,0,0,0.5)`.
  Keep `font.family` (`Roboto, -apple-system, "Segoe UI", sans-serif`) and `font.size-sm/base/lg` = 11/13/16px — these have NO Figma variables (census-derived, documented); add a comment in the file saying so.
  DELETE the invented tokens: `brand-strong #348AEE`, `success #3BA55D`, `warning #F9C901`, `radius.sm 4px`, `radius.md 8px`, `space.3 12px`, `space.6 32px`.
  `border-strong #DADADA` has no variable but 16,467 uses — keep it ONLY as `--hx-color-border-untokenised-dadada`? NO — instead omit it and report it as a CANT-TELL for the human.
- [ ] **Step 3: Update the build test** to assert several real values, e.g. `--hx-radius-pill: 9999px`, `--hx-color-background-success: #8DC26F`, `--hx-color-text-warning: #FF991F`, `--hx-color-background-accent: #32B4EB`. Run red → build → green.
- [ ] **Step 4: Build + test** `pnpm --filter @cvetkov_es/tokens build && pnpm --filter @cvetkov_es/tokens test`.
- [ ] **Step 5: Commit** `feat(tokens)!: re-base on real Figma variables`.

---

### Task 2: Rewrite `@cvetkov_es/css` on the new tokens + real geometry

**Files:** rewrite `packages/css/src/index.css`; update `packages/css/build.test.mjs`.

**Ground truth geometry (from the `.fig`; cite in CSS comments):**
- Button: height **32**, radius **pill 9999** (Primary/Secondary/Ghost); `Dashed` variant radius **3**.
  - Ghost: fill `#FFFFFF` normal → `#EEEEEE` hover/active; **no stroke in ANY state**.
- Input & Select: radius **3**, height **32**, fill `#FFFFFF`, stroke `#EEEEEE` → hover `#999999` → focus `#32B4EB`; disabled fill `#F8F8F8`.
- Checkbox **18×18** radius **2**. Radio **18×18** radius **999**. Toggle **24×14** radius **999**.
- Tooltip: radius **5**, fill `#353535`, text `#FEFEFE` 13px.
- Modal (`ModalBasic`): radius **5**, width **560**. Scrim = `color-overlay` `rgba(0,0,0,0.5)`.
- TableRow height **40**, hover `#F8F8FA` (`color-background-hoverlist`). TableHead 11px `#777777`.
- Tag radius **3** height **32**. Chip radius **999**. Badge-Count radius **9999** fill `#ED1940`.

- [ ] **Step 1:** Rewrite every `.hx-*` rule to reference the NEW token names, applying the geometry above. No hardcoded hex/px where a token exists. Cite the source (`.fig` value + count) in a comment above each block.
- [ ] **Step 2:** Update `build.test.mjs` to assert the bundle contains a real value (e.g. `#8dc26f`) and `.hx-btn`. Red → build → green.
- [ ] **Step 3:** `pnpm --filter @cvetkov_es/css build && pnpm --filter @cvetkov_es/css test`.
- [ ] **Step 4: Commit** `feat(css)!: real Figma geometry + re-based tokens`.

---

### Task 3: Button — pill, drop `danger`, add `ghost`

**Files:** `packages/react/src/Button/Button.tsx`, `.test.tsx`; `packages/react/src/index.ts`; `packages/react/treeshake.test.mjs`.

**Interface produced:** `ButtonProps { variant?: "primary" | "secondary" | "ghost" | "dashed"; size?: "md" | "sm" }`, default `primary`/`md`. `danger` is REMOVED (no red filled button exists in the design).

- [ ] **Step 1: Write failing tests** — `variant="ghost"` → `hx-btn--ghost`; `variant="dashed"` → `hx-btn--dashed`; `variant="danger"` no longer type-checks/renders a danger class (assert the class is absent); default is primary; ref forwarding + className preservation still pass.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** the new variant union (keep `/* @__PURE__ */ Object.assign(/* @__PURE__ */ React.forwardRef(...), { displayName })` and `{...rest}` first).
- [ ] **Step 4: Run green**, plus the treeshake guard.
- [ ] **Step 5: Commit** `feat(react)!: Button pill + ghost/dashed variants, remove danger`.

---

### Task 4: Avatar — real 9-colour palette

**Files:** `packages/react/src/Avatar/Avatar.tsx`, `.test.tsx`; `packages/css/src/index.css`.

**Ground truth:** the design defines 9 avatar colour sets, each with background/border/text:
one `#FDE8EC`/`#ED1940`, two `#FFF5E8`/`#FF991F`, three `#FEF9E5`/`#F9C901`, four `#E5F6EF`/`#00A861`, five `#EBFAE8`/`#3FCE1B`, six `#E7ECF8`/`#1243BF`, seven `#ECF3FF`/`#4688FF`, eight `#F6E5FB`/`#A200DB`, nine `#F9E5F7`/`#C500B1` (text colour == border colour in every set).

- [ ] **Step 1: Write failing tests** — Avatar picks a colour set deterministically from `name` (same name → same set; different names spread across sets); renders `hx-avatar--<n>`; initials fallback still works.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** — add `.hx-avatar--one..nine` classes in css from the tokens; component hashes `name` → one of 9 sets (simple deterministic char-sum modulo 9; document it).
- [ ] **Step 4: Run green** + treeshake guard.
- [ ] **Step 5: Commit** `feat(react): Avatar uses the real 9-colour palette`.

---

### Task 5: Update docs + playground for the new API

**Files:** `llms.txt`, `README.md`, `playground/src/main.tsx`.

- [ ] **Step 1:** Regenerate `llms.txt`'s token table from `packages/tokens/dist/variables.css` (all new names/values) and its Button entry (new variants). Cross-check every listed token exists in the built CSS and every component exists in the barrel.
- [ ] **Step 2: Add the rules that prevent the 0.1.0 defect class:**
  - `#ED1940` (`--hx-color-*-error`) is for **text, icons and borders of errors — NEVER a button fill**. There is no red button in HubEx; destructive actions use a normal `primary` button.
  - Buttons are **pill-shaped**; do not invent a radius — use `--hx-radius-pill`.
  - Never hardcode a hex/px that isn't a token.
- [ ] **Step 3:** Update the playground: remove `variant="danger"`, show `ghost`/`dashed`, show the 9 avatar colours.
- [ ] **Step 4:** README — document the breaking changes and the Figma-variable naming.
- [ ] **Step 5: Commit** `docs: 0.2.0 API + anti-invention rules`.

---

### Task 6: Release 0.2.0

- [ ] **Step 1:** Full gate: `NODE_OPTIONS="--max-old-space-size=1536" pnpm build && pnpm test` — all green incl. treeshake guard.
- [ ] **Step 2:** Changeset (minor for all three packages — pre-1.0, breaking goes in minor), `pnpm version-packages` → 0.2.0, CHANGELOGs written. The changeset description MUST list the breaking changes: token names re-based on Figma variables; `Button variant="danger"` removed; radius/spacing/success/warning values corrected.
- [ ] **Step 3:** Commit + tag `v0.2.0`.
- [ ] **Step 4:** Publish (CI publishes on tag push, or `pnpm -r publish --access public`). Verify all three are live at 0.2.0 with correct cross-deps.
- [ ] **Step 5:** End-to-end consumer check: fresh dir, install `@cvetkov_es/react@0.2.0` + `@cvetkov_es/css@0.2.0`, bundle a Button-only import → still tiny, no react-dom, class is `hx-btn` and radius resolves to the pill token.

---

## CANT-TELL — needs a human decision

- `#DADADA` (our old `border-strong`) — 16,467 uses in the design but **no Figma variable**. Drop it, or ask the designer to tokenise it?
- Pill magic numbers: buttons use `9999`, `Button-Circle` uses `999`, chips `999`. Collapse to one `--hx-radius-pill`?
- `Checkbox` radius `2` is off the 3/5/9999 scale — keep the literal 2 (it's what the file says) or round to `small`?
- `colors/background/color-backgroundg-*` — the typo is upstream in Figma. Keep verbatim (planned) or fix locally and diverge from the design file?
- Typography has **no Figma variables** — 11/13/16px + Roboto are census-derived, not authoritative. Should the designer add type variables?

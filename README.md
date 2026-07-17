# HubEx UI

HubEx UI is the design system for HubEx plugins: a set of React components
that reproduce the patterns already used across the HubEx product, so a
plugin built against it looks and behaves consistently with the rest of the
system.

If you're pointing an AI at this repo to build plugin UI, give it
[`llms.txt`](./llms.txt) — it's the single reference for every component's
real props and every design token. [`AGENTS.md`](./AGENTS.md) is the two-line
snippet meant to be pasted into a *plugin* repo's own `CLAUDE.md`/`AGENTS.md`
so its agent knows to read `llms.txt` first.

## Packages

This is a monorepo of three npm packages with a strict, one-directional
dependency chain:

```
@cvetkov_es/tokens  →  @cvetkov_es/css  →  @cvetkov_es/react
```

- **`@cvetkov_es/tokens`** — the source of truth for design values (colors, font,
  radii, spacing). Built with Style Dictionary from `packages/tokens/src/tokens.json`
  into `--hx-*` CSS custom properties (`dist/variables.css`) and a JS/JSON
  export.
- **`@cvetkov_es/css`** — the stylesheet. Every `.hx-*` class a component renders
  is defined here, built from `--hx-*` tokens via PostCSS into
  `dist/hubex.css`. Depends on `@cvetkov_es/tokens`.
- **`@cvetkov_es/react`** — the components. Each component maps its props to
  `.hx-*` class names; it renders no CSS of its own and imports no
  stylesheet — this keeps the package tree-shakeable (`"sideEffects": false`,
  one esbuild chunk per component). Depends on `@cvetkov_es/css` and
  `@cvetkov_es/tokens` only as `dependencies` for typing/tooling purposes — at
  runtime the consumer app is the one that loads the stylesheet (see below).

## 0.2.0: re-based on real Figma variables

0.1.0's design tokens and part of its component API were **invented** —
plausible-looking values that didn't actually match the design. 0.2.0
re-bases everything on the real, named Figma variables. If anything you
wrote (or any AI-generated code) targets 0.1.0, read this before upgrading.

### Breaking changes

- **Every token name changed, and most values did too.** 0.1.0 had ~27
  invented tokens — plausible-looking names and values with no real Figma
  variable behind them. They're gone. In their place: **104 tokens** in
  `packages/tokens/dist/variables.css` — **100 map 1:1 to real Figma
  variables**, plus 4 `font/*` tokens that still have no Figma equivalent
  (census-derived, unchanged carry-over from 0.1.0). See
  [`llms.txt`](./llms.txt)'s "Design tokens" section for the complete,
  current table, grouped by namespace. For the exact old-name → new-name
  mapping used during the re-base — including the handful of old values
  that turned out to be simply wrong rather than just renamed (an invented
  success color, an invented stronger-brand shade with no real counterpart,
  an invented border color, invented radii) — see the token-name legend
  comment at the top of `packages/css/src/index.css`. Do not reuse an old
  token name from memory or from anything written against 0.1.0, and don't
  assume old → new is a 1:1 renaming: re-check each call site rather than
  search/replace (the radius and spacing scales were renumbered too).
- **`Button`'s `variant` prop dropped its one destructive option and gained
  two new ones:** now `variant?: "primary" | "secondary" | "ghost" |
  "dashed"`. There is no red/filled destructive button anywhere in the real
  design — code passing the old destructive value to `variant` no longer
  compiles. Use a plain `primary` button for destructive actions instead.
- **Buttons are pill-shaped**: `border-radius: var(--hx-radius-pill)`
  (`9999px`) for `primary`/`secondary`/`ghost`, replacing 0.1.0's invented
  fixed radius. The `dashed` variant is a real, measured exception —
  `--hx-radius-small` (`3px`) — not a fallback or an oversight.
- **`Avatar` now auto-colors itself from `name`.** There is no `color` prop
  and never was one, but 0.1.0's single flat placeholder fill is gone: each
  `name` now deterministically resolves (a simple hash, not user-chosen) to
  one of **9 real Figma colour sets**. `AvatarProps` itself is unchanged
  (`src?`, `name` required, `size?`) — this is a visual-only change.

### Figma-variable naming convention

Every `--hx-*` token name (barring the 4 `font/*` exceptions above) is
`--hx-` plus the real Figma variable's own path, flattened with hyphens —
e.g. Figma variable `colors/text/color-text-primary` became
`--hx-color-text-primary`. Names are copied **verbatim, including Figma's
own typo**: the `backgroundg` namespace (`--hx-color-backgroundg-error`,
`--hx-color-backgroundg-warning`) really is spelled that way upstream
(`colors/background/color-backgroundg-error`) — it is **not** a typo in
this repo and must not be "corrected" to `background`. When Figma adds or
renames a variable, mirror it exactly rather than choosing a name that
merely reads better.

## Install (plugin authors)

The packages publish to the public npm registry — install them like any
other dependency (no extra config):

```bash
pnpm add @cvetkov_es/react @cvetkov_es/css
```

Then import the stylesheet once at your app entry, and use the components:

```tsx
// app entry (e.g. main.tsx) — load the styles exactly once
import "@cvetkov_es/css";

import { Button } from "@cvetkov_es/react";
```

`@cvetkov_es/react` never imports CSS itself (so it tree-shakes); `@cvetkov_es/css`
is the single stylesheet you load once. For `Icon`, also load the Material
Icons font in your app.

> Until the first `npm publish` runs (see "Releasing"), you can install
> straight from a git tag instead:
> `pnpm add github:cvetkov-es/HubEx.Design#v0.1.0`.

### Required setup

```ts
// your app's entry point — once
import "@cvetkov_es/css";
```

This loads every `.hx-*` class and `--hx-*` token globally. Components
themselves import no CSS (that's what keeps unused components out of your
bundle), so skipping this import means components render unstyled.

If you use `Icon`, also load the Material Icons webfont in your app and
alias it to the font-family `"material"` — this package ships no font files
or SVGs by design (a prior in-house icon package bundled ~540KB of SVGs and
broke tree-shaking; see `packages/react/src/Icon/Icon.tsx`).

Full component reference, real prop signatures, and the token table: see
[`llms.txt`](./llms.txt).

## Monorepo development

```bash
pnpm install       # install workspace deps
pnpm build         # turbo run build — tokens → css → react, in dependency order
pnpm test          # turbo run test — unit tests + tree-shake/build guards, all packages
pnpm dev           # turbo run dev — watch mode across packages
pnpm harvest       # node tools/harvest.mjs — re-scan source/Образцы into raw-inventory.json
```

To run the playground app (the one consumer of `@cvetkov_es/css` + `@cvetkov_es/react`
in this repo, useful for visually checking a component):

```bash
cd playground && pnpm dev
```

`@cvetkov_es/react`'s `tsup` build (which emits `.d.ts` files) can run out of
memory on low-RAM machines. If `pnpm build` OOMs in `packages/react`, retry
with a larger heap:

```bash
NODE_OPTIONS=--max-old-space-size=1536 pnpm build
```

## Adding a component

Follow the pattern already used by every component in `packages/react/src/`:

1. Create `packages/react/src/<Name>/<Name>.tsx`:
   - Define a `<Name>Props` interface that extends the matching
     `React.*HTMLAttributes<...>` (or a narrower `Omit<...>` if a native prop
     needs to be redefined, e.g. `onChange`).
   - Map component-specific props to `.hx-*` class names; merge any
     consumer-supplied `className` in (`[...].filter(Boolean).join(" ")`).
   - Use `React.forwardRef` and set `displayName` via
     `/* @__PURE__ */ Object.assign(...)` — **not** a separate
     `X.displayName = "X"` statement. A bare assignment to an otherwise-unused
     binding is a side effect that defeats tree-shaking; see the comment atop
     `Button.tsx` for the full rationale. (A plain *named* function component
     with no `forwardRef`, as used by `Breadcrumbs`/`Tabs`/`Menu`/`Tooltip`/
     `Table`, is also fine — naming the function alone gives it a correct
     `displayName` with no extra statement.)
   - The component must import **no** CSS.
2. Add the corresponding classes to `packages/css/src/index.css`, built from
   `--hx-*` tokens only — no hardcoded hex/px values. If a value doesn't map
   to an existing token, that's a signal to check `packages/tokens/src/tokens.json`
   before inventing a one-off number.
3. Add a colocated test at `packages/react/src/<Name>/<Name>.test.tsx`.
4. Export the component and its prop type from `packages/react/src/index.ts`.
5. Extend the tree-shake guard in `packages/react/treeshake.test.mjs`: add an
   assertion that a bundle importing only your new component does not pull in
   any other component's `.hx-*` class name (and vice versa — add your
   component's class to the other guard cases).
6. Add a usage example to the playground (`playground/src/main.tsx`) and to
   `llms.txt`'s component index (real props, one minimal example — see the
   existing entries for the format).

## Releasing

Versioning and changelogs are managed with [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset          # record an intent-to-release for the packages you touched
pnpm version-packages    # changeset version — bumps package.json + writes CHANGELOG.md per package
pnpm release             # turbo run build && changeset publish — NOT wired to a registry yet
```

Publishing to the public npm registry is automated by
[`.github/workflows/release.yml`](.github/workflows/release.yml): pushing a
version tag (`v*`) builds, tests, and runs `changeset publish`, which
publishes any package whose version isn't already on npm.

Packages publish under the `@cvetkov_es` scope (the maintainer's own npm
username scope — no npm organization required).

**One-time setup for automated CI publishing (a human does this once):**

1. Create an npm **Automation** access token at [npmjs.com](https://www.npmjs.com) → Access Tokens (must have publish rights for `@cvetkov_es/*`).
2. Add it to this repo: **Settings → Secrets and variables → Actions → New
   repository secret**, named `NPMJS_TOKEN`. (This is a GitHub Actions
   *secret* in repo settings — not a `.env` file; CI never reads `.env`.)

**Cutting a release afterwards:**

```bash
pnpm changeset          # record what changed (patch/minor/major per package)
pnpm version-packages    # bump package.json versions + write CHANGELOG.md
git commit -am "chore: release" && git tag vX.Y.Z && git push --follow-tags
# → the release workflow publishes to npm automatically
```

The first tagged release is `v0.1.0` (`@cvetkov_es/tokens`, `@cvetkov_es/css`,
`@cvetkov_es/react` all at `0.1.0`). It publishes on the first tag push after
`NPM_TOKEN` is configured.

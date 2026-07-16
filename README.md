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
@hubex/tokens  →  @hubex/css  →  @hubex/react
```

- **`@hubex/tokens`** — the source of truth for design values (colors, font,
  radii, spacing). Built with Style Dictionary from `packages/tokens/src/tokens.json`
  into `--hx-*` CSS custom properties (`dist/variables.css`) and a JS/JSON
  export.
- **`@hubex/css`** — the stylesheet. Every `.hx-*` class a component renders
  is defined here, built from `--hx-*` tokens via PostCSS into
  `dist/hubex.css`. Depends on `@hubex/tokens`.
- **`@hubex/react`** — the components. Each component maps its props to
  `.hx-*` class names; it renders no CSS of its own and imports no
  stylesheet — this keeps the package tree-shakeable (`"sideEffects": false`,
  one esbuild chunk per component). Depends on `@hubex/css` and
  `@hubex/tokens` only as `dependencies` for typing/tooling purposes — at
  runtime the consumer app is the one that loads the stylesheet (see below).

## Install (plugin authors)

The packages aren't published to a registry yet. Until then, install
straight from a git tag:

```bash
pnpm add github:<org>/hubex-ui#v0.1.0
```

That installs the monorepo at a tagged commit; point your own `package.json`
dependency at the specific subpackage path if your package manager needs it
(e.g. `"@hubex/react": "github:<org>/hubex-ui#v0.1.0&path:packages/react"`).
Replace `<org>` and the tag with the real values once the repo is hosted.

GitHub Packages + a CI-driven publish step are planned but out of scope for
now (see "Releasing" below).

### Required setup

```ts
// your app's entry point — once
import "@hubex/css";
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

To run the playground app (the one consumer of `@hubex/css` + `@hubex/react`
in this repo, useful for visually checking a component):

```bash
cd playground && pnpm dev
```

`@hubex/react`'s `tsup` build (which emits `.d.ts` files) can run out of
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

Not yet wired up — release automation via Changesets is planned as a
follow-up (see Task 13). Until then, tag releases manually (`git tag vX.Y.Z`)
against a commit where `pnpm build && pnpm test` is green.

# @cvetkov_es/css

## 0.2.0

### Minor Changes

- Re-base the whole design system on the 100 real named Figma variables (0.1.0 had shipped invented token names and values). BREAKING — pre-1.0, so breaking changes ship as a minor bump.

  - **Tokens re-based on Figma variables.** Token names now mirror the Figma variable names verbatim (e.g. `--hx-color-text-primary`, `--hx-color-background-accent`, `--hx-radius-pill`). The 0.1.0 invented names are removed: `--hx-color-brand`, `--hx-color-danger`, `--hx-color-success`, `--hx-color-border-strong`, `--hx-radius-sm/md`, `--hx-space-*`, bare `--hx-color-text`. Consumers referencing old `--hx-*` names must migrate.
  - **Corrected values.** `success` is `#8DC26F` (was invented `#3BA55D`); the star/rating yellow `#F9C901` is now `--hx-color-icon-rating` (not a "warning" token); radius scale is `small 3px / medium 5px / pill 9999px` (was invented `4/8`); real `--hx-spacing-*` replaces the invented `--hx-space-*`. Invented `brand-strong #348AEE` removed entirely.
  - **`Button variant="danger"` removed.** There is no red filled button in the HubEx design — `#ED1940` is only error text/icons/borders. Destructive actions use a normal `primary` button. `Button` gains `ghost` and `dashed` variants and is pill-shaped.
  - **Avatar** now auto-derives one of the 9 real Figma colour sets deterministically from `name` (no colour prop).
  - CSS geometry corrected to the `.fig` ground truth and a `var()` validator added so no `.hx-*` rule can reference a token that doesn't exist.

  Note (kept intentionally, verbatim from Figma): the upstream `backgroundg` typo in `--hx-color-backgroundg-error/-warning`, and the census-derived `--hx-font-*` tokens (11/13/16px Roboto — the design has no type-scale variables yet). Left for a designer decision: `#DADADA` (heavily used but has no Figma variable) is dropped; the `999`/`9999` pill values are both mapped to `--hx-radius-pill`; `Checkbox` radius `2` is off the 3/5/9999 scale.

### Patch Changes

- Updated dependencies
  - @cvetkov_es/tokens@0.2.0

## 0.1.0

### Minor Changes

- Initial release of the HubEx UI design system: design tokens, base CSS, and 24 React components.

### Patch Changes

- Updated dependencies
  - @cvetkov_es/tokens@0.1.0

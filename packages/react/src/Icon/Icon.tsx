import * as React from "react";

// Official DS: `{name, size?, color?}` icon-color tokens (`keyof
// colors.icon`), mapped 1:1 onto `--hx-color-icon-<suffix>` CSS variables.
export type IconColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "neutral"
  | "subtle"
  | "inverse"
  | "weak"
  | "accent"
  | "accent-hover"
  | "success"
  | "warning"
  | "error"
  | "rating";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: string;
  /**
   * Pixel size, snapped to the nearest `--hx-size-icon-*` token (12/14/16/18/
   * 20/24/28/32/40/48/56/60/64). @default 20 (--hx-size-icon-x5)
   */
  size?: number;
  color?: IconColor;
  /** Accessible name. When set, the icon is exposed to assistive tech (no
   * longer `aria-hidden`) — matches the official `ariaLabel` prop. */
  ariaLabel?: string;
}

// `--hx-size-icon-*` token scale (px -> CSS var suffix). Any `size` value is
// snapped onto the nearest of these via a `.hx-icon--<suffix>` modifier class
// — the component NEVER sets an inline `fontSize` (that was the prior
// literal-styling anti-pattern this task fixes; see the .hx-icon CSS comment
// in packages/css/src/index.css).
const ICON_SIZE_PX_TO_TOKEN: Record<number, string> = {
  12: "x3",
  14: "x350percent",
  16: "x4",
  18: "x450percent",
  20: "x5",
  24: "x6",
  28: "x7",
  32: "x8",
  40: "x10",
  48: "x12",
  56: "x14",
  60: "x15",
  64: "x16",
};
const ICON_SIZE_STEPS = Object.keys(ICON_SIZE_PX_TO_TOKEN).map(Number);
const DEFAULT_ICON_SIZE_PX = 20;

function nearestIconSizeToken(size: number): string {
  const nearestPx = ICON_SIZE_STEPS.reduce((closest, candidate) =>
    Math.abs(candidate - size) < Math.abs(closest - size) ? candidate : closest
  );
  return ICON_SIZE_PX_TO_TOKEN[nearestPx];
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
// Font-based glyph rendering ONLY — see the .hx-icon CSS comment in
// packages/css/src/index.css. This component MUST NOT import, inline, or
// bundle any SVG icon set: a prior in-house package bundled 1579 SVG icons
// (~540KB) into one file and destroyed tree-shaking. The Material Icons font
// (family "material") is loaded by the consumer application, not shipped here.
export const Icon = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, IconProps>(
    ({ name, size = DEFAULT_ICON_SIZE_PX, color, ariaLabel, className, ...rest }, ref) => {
      const sizeToken = nearestIconSizeToken(size);
      const cls = [
        "material",
        "hx-icon",
        `hx-icon--${sizeToken}`,
        color && `hx-icon--color-${color}`,
        className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <span
          {...rest}
          ref={ref}
          className={cls}
          aria-hidden={ariaLabel !== undefined ? undefined : "true"}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        >
          {name}
        </span>
      );
    }
  ),
  { displayName: "Icon" }
);

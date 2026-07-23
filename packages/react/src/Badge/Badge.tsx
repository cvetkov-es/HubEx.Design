import * as React from "react";

// BREAKING (0.3.x): this replaces the old single `Badge` with
// `variant: 'dot'|'count'|'tag'` + `count`. That component is split into five
// separate named exports matching the official DS's Badge family: `Badge`
// (this file, the semantic pill), `BadgeDot`, `BadgeCount`, `BadgeTag`,
// `BadgeShift` (see their own files in this directory). Old
// `<Badge variant="dot|count|tag" count={n}>` call sites must migrate to the
// matching new component.
export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "error";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  children: React.ReactNode;
  /** @default 'neutral' */
  variant?: BadgeVariant;
  /** Accessible name override; also settable via the native `aria-label` attribute. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Badge = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = "neutral", ariaLabel, className, children, ...rest }, ref) => {
      const cls = ["hx-badge", `hx-badge--${variant}`, className].filter(Boolean).join(" ");
      return (
        <span
          {...rest}
          ref={ref}
          className={cls}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        >
          {children}
        </span>
      );
    }
  ),
  { displayName: "Badge" }
);

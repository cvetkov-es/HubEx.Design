import * as React from "react";
import type { BadgeTagTone, BadgeTagType } from "./Badge.types";

export interface BadgeTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** @default 'new' */
  type?: BadgeTagType;
  /** Contrast of the text/border against the fill. @default 'light' */
  tone?: BadgeTagTone;
  children?: React.ReactNode;
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const BadgeTag = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeTagProps>(
    ({ type = "new", tone = "light", ariaLabel, className, children, ...rest }, ref) => {
      const cls = [
        "hx-badge-tag",
        `hx-badge-tag--${type}`,
        `hx-badge-tag--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ");
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
  { displayName: "BadgeTag" }
);

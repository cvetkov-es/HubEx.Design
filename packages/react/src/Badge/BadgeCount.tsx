import * as React from "react";
import type { BadgeBackgroundToken } from "./Badge.types";

export interface BadgeCountProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Counter value. */
  value: string | number;
  /** Background token from `--hx-color-background-*`. @default 'error' */
  background?: BadgeBackgroundToken;
  /** Accessible name override for the counter. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
// Pill built from --hx-radius-pill + the chosen --hx-color-background-* token
// (default error), matching Task 2 ground truth for the old Badge-Count variant.
export const BadgeCount = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeCountProps>(
    ({ value, background = "error", ariaLabel, className, ...rest }, ref) => {
      const cls = ["hx-badge-count", `hx-badge-count--bg-${background}`, className]
        .filter(Boolean)
        .join(" ");
      return (
        <span
          {...rest}
          ref={ref}
          className={cls}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        >
          {value}
        </span>
      );
    }
  ),
  { displayName: "BadgeCount" }
);

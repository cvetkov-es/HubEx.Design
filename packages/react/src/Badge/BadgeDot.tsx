import * as React from "react";
import type { BadgeBackgroundToken } from "./Badge.types";

export interface BadgeDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Background token from `--hx-color-background-*`. @default 'error' */
  background?: BadgeBackgroundToken;
  /** Accessible name for the (otherwise textless) indicator. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const BadgeDot = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeDotProps>(
    ({ background = "error", ariaLabel, className, ...rest }, ref) => {
      const cls = ["hx-badge-dot", `hx-badge-dot--bg-${background}`, className]
        .filter(Boolean)
        .join(" ");
      return (
        <span
          {...rest}
          ref={ref}
          className={cls}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        />
      );
    }
  ),
  { displayName: "BadgeDot" }
);

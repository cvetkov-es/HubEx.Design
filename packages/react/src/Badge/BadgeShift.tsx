import * as React from "react";
import { Tooltip, type TooltipPlacement } from "../Tooltip/Tooltip";
import type { BadgeShiftSize, BadgeShiftStatus } from "./Badge.types";

export interface BadgeShiftProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** @default 'offline' */
  status?: BadgeShiftStatus;
  /** Container size: xl 24x24, l 16x16, m 12x12, s 8x8 px. @default 'xl' */
  size?: BadgeShiftSize;
  /** Tooltip text, if any. */
  tooltipContent?: string;
  /** @default 'top' */
  tooltipPlacement?: TooltipPlacement;
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const BadgeShift = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeShiftProps>(
    (
      {
        status = "offline",
        size = "xl",
        tooltipContent,
        tooltipPlacement = "top",
        ariaLabel,
        className,
        ...rest
      },
      ref
    ) => {
      const cls = [
        "hx-badge-shift",
        `hx-badge-shift--${status}`,
        `hx-badge-shift--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ");
      const indicator = (
        <span
          {...rest}
          ref={ref}
          className={cls}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        />
      );
      // Only reaches for the (cloneElement-based) Tooltip when there's
      // actually tooltip text to show — otherwise the indicator renders bare,
      // matching the official API's optional `tooltipContent`.
      return tooltipContent ? (
        <Tooltip content={tooltipContent} placement={tooltipPlacement}>
          {indicator}
        </Tooltip>
      ) : (
        indicator
      );
    }
  ),
  { displayName: "BadgeShift" }
);

import * as React from "react";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  variant?: "dot" | "count" | "tag";
  count?: number;
  children?: React.ReactNode;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Badge = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = "tag", count, className, children, ...rest }, ref) => {
      const cls = ["hx-badge", `hx-badge--${variant}`, className].filter(Boolean).join(" ");
      const content = variant === "dot" ? null : variant === "count" ? count : children;
      return (
        <span {...rest} ref={ref} className={cls}>
          {content}
        </span>
      );
    }
  ),
  { displayName: "Badge" }
);

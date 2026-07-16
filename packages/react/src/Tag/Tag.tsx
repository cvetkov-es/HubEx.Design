import * as React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "neutral" | "brand" | "danger";
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Tag = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, TagProps>(({ color = "neutral", className, ...rest }, ref) => {
    const cls = ["hx-tag", `hx-tag--${color}`, className].filter(Boolean).join(" ");
    return <span {...rest} ref={ref} className={cls} />;
  }),
  { displayName: "Tag" }
);

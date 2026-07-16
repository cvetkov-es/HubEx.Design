import * as React from "react";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: string;
  size?: number;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
// Font-based glyph rendering ONLY — see the .hx-icon CSS comment in
// packages/css/src/index.css. This component MUST NOT import, inline, or
// bundle any SVG icon set: a prior in-house package bundled 1579 SVG icons
// (~540KB) into one file and destroyed tree-shaking. The Material Icons font
// (family "material") is loaded by the consumer application, not shipped here.
export const Icon = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, IconProps>(({ name, size, className, style, ...rest }, ref) => {
    const cls = ["material", "hx-icon", className].filter(Boolean).join(" ");
    const mergedStyle = size ? { fontSize: size, ...style } : style;
    return (
      <span {...rest} ref={ref} className={cls} style={mergedStyle} aria-hidden="true">
        {name}
      </span>
    );
  }),
  { displayName: "Icon" }
);

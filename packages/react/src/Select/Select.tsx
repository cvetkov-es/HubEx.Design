import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Select = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSelectElement, SelectProps>(({ invalid, className, ...rest }, ref) => {
    const cls = ["hx-select", invalid && "hx-select--invalid", className].filter(Boolean).join(" ");
    return <select ref={ref} className={cls} {...rest} />;
  }),
  { displayName: "Select" }
);

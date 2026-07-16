import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Input = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...rest }, ref) => {
    const cls = ["hx-input", invalid && "hx-input--invalid", className].filter(Boolean).join(" ");
    return <input ref={ref} className={cls} {...rest} />;
  }),
  { displayName: "Input" }
);

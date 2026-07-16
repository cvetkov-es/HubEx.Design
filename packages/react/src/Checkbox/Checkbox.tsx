import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Checkbox = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, id, ...rest }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? (label ? generatedId : undefined);
    const cls = ["hx-checkbox", className].filter(Boolean).join(" ");
    const input = <input ref={ref} type="checkbox" id={inputId} className={cls} {...rest} />;
    if (!label) return input;
    return (
      <label htmlFor={inputId}>
        {input} {label}
      </label>
    );
  }),
  { displayName: "Checkbox" }
);

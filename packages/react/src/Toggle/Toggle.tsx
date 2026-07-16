import * as React from "react";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "checked"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Toggle = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLButtonElement, ToggleProps>(
    (
      {
        checked = false,
        onChange,
        disabled,
        className,
        onClick,
        type: _type,
        role: _role,
        "aria-checked": _ariaChecked,
        ...rest
      },
      ref
    ) => {
      const cls = ["hx-toggle", className].filter(Boolean).join(" ");
      return (
        <button
          type="button"
          ref={ref}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          className={cls}
          onClick={(event) => {
            onClick?.(event);
            onChange?.(!checked);
          }}
          {...rest}
        />
      );
    }
  ),
  { displayName: "Toggle" }
);

import * as React from "react";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Prefer a plain string; ReactNode is supported for richer markup (matches the official API). */
  label?: React.ReactNode;
  /** Accessible name override; also settable via the native `aria-label` attribute. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Radio = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
    const { label, className, id, disabled, ariaLabel, ...rest } = props;
    const generatedId = React.useId();
    const inputId = id ?? (label ? generatedId : undefined);
    const cls = ["hx-radio", className].filter(Boolean).join(" ");

    // `...rest` is spread FIRST; every controlled attribute below (type, id,
    // className, disabled, aria-label) is set AFTER so it can never be
    // silently clobbered by a same-named prop the caller passed through
    // native HTML attributes (see Button.tsx for the full rationale).
    const input = (
      <input
        {...rest}
        ref={ref}
        type="radio"
        id={inputId}
        className={cls}
        disabled={disabled}
        {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      />
    );
    if (!label) return input;
    const labelCls = ["hx-radio-label", disabled && "hx-radio-label--disabled"].filter(Boolean).join(" ");
    return (
      <label htmlFor={inputId} className={labelCls}>
        {input}
        <span className="hx-radio-label__text">{label}</span>
      </label>
    );
  }),
  { displayName: "Radio" }
);

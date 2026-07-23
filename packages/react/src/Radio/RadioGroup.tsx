import * as React from "react";
import { Radio } from "./Radio";

export type RadioGroupOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  id?: string;
};

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Shared `name` applied to every Radio in the group (native radio grouping). */
  name: string;
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Called when the selection changes: `(value, event)`. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Convenience API for simple lists. */
  options?: RadioGroupOption[];
  /** Layout direction; defaults to `"column"`. */
  direction?: "row" | "column";
  /** Disables every option in the group. */
  disabled?: boolean;
  /** Accessible name override for the `radiogroup`; also settable via `aria-label`. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const RadioGroup = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, RadioGroupProps>((props, ref) => {
    const {
      name,
      value,
      defaultValue,
      onChange,
      options = [],
      direction = "column",
      disabled,
      ariaLabel,
      className,
      ...rest
    } = props;

    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : uncontrolledValue;

    const cls = [
      "hx-radio-group",
      direction === "row" ? "hx-radio-group--row" : "hx-radio-group--column",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // `...rest` is spread FIRST; every controlled attribute below (role,
    // className, aria-label) is set AFTER so it can never be silently
    // clobbered by a same-named prop the caller passed through (see
    // Button.tsx for the full rationale).
    return (
      <div
        {...rest}
        ref={ref}
        role="radiogroup"
        className={cls}
        {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      >
        {options.map((option) => {
          const optionDisabled = disabled || option.disabled;
          return (
            <Radio
              key={option.value}
              id={option.id}
              name={name}
              value={option.value}
              label={option.label}
              checked={selectedValue === option.value}
              disabled={optionDisabled}
              onChange={(event) => {
                // Belt-and-suspenders: real browsers never fire `change` on a
                // disabled control, but this guard keeps a stray/synthetic
                // event from selecting a disabled option regardless.
                if (optionDisabled) return;
                if (!isControlled) setUncontrolledValue(option.value);
                onChange?.(option.value, event);
              }}
            />
          );
        })}
      </div>
    );
  }),
  { displayName: "RadioGroup" }
);

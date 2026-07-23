import * as React from "react";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  /** Form field name. Meaningful now that Toggle is backed by a real `<input>`. */
  name: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Accessible name override; also settable via the native `aria-label` attribute. */
  ariaLabel?: string;
  /**
   * BREAKING (post-0.2.x): signature changed from `(checked: boolean) => void`
   * to `(checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void`
   * to match the official @hubex/design-system Toggle API — the boolean is
   * still first, but callers relying on a single-argument callback must add
   * the second parameter (or ignore it).
   */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ELEMENT CHOICE (Task 6): the official Toggle (see
// tools/.official-ds-ref/.../Toggle.styles.d.ts — ToggleContainer/ToggleInput/
// ToggleSlider) is a <label> wrapping a real, visually-hidden
// <input type="checkbox"> plus a decorative slider span, which is what makes
// a genuine ChangeEvent<HTMLInputElement> and a meaningful `name` possible.
// This package doesn't need the extra 3-node structure to get the same
// result: Checkbox and Radio already use the appearance:none-input-with-
// ::after-pseudo-element pattern for their own visuals (see .hx-checkbox /
// .hx-radio in packages/css/src/index.css), so Toggle reuses that SAME
// pattern — a single <input type="checkbox" role="switch">, its ::after is
// the thumb — instead of introducing a Container/Input/Slider structure.
// This was chosen over option (a) (keep the <button>, invent a synthetic
// event) specifically so `event` in onChange is a real ChangeEvent, and over
// copying the official 3-node structure because it would be pure
// boilerplate here: the single-input approach yields an identical DOM
// contract (a focusable, labelable checkbox-shaped control named `name`)
// with less markup, and keeps the "hx-toggle" tree-shake sentinel on the one
// interactive element instead of a wrapper.
//
// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Toggle = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, ToggleProps>((props, ref) => {
    const {
      name,
      label,
      checked = false,
      disabled,
      ariaLabel,
      onChange,
      className,
      id,
      type: _type,
      role: _role,
      "aria-checked": _ariaChecked,
      ...rest
    } = props;
    const generatedId = React.useId();
    const inputId = id ?? (label ? generatedId : undefined);
    const cls = ["hx-toggle", className].filter(Boolean).join(" ");

    // `...rest` is spread FIRST; every controlled attribute below (type,
    // role, id, name, className, checked, aria-checked, disabled,
    // aria-label) is set AFTER so stray/legacy props (including a foreign
    // `type`, `role`, or `aria-checked` destructured above) can never
    // silently override the controlled ones (see Button.tsx for the full
    // rationale).
    const input = (
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        role="switch"
        id={inputId}
        name={name}
        className={cls}
        checked={checked}
        aria-checked={checked}
        disabled={disabled}
        {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        onChange={(event) => {
          // Belt-and-suspenders: real browsers never fire `change` on a
          // disabled control, but this guard keeps a stray/synthetic event
          // from invoking onChange regardless.
          if (disabled) return;
          onChange?.(event.target.checked, event);
        }}
      />
    );
    if (!label) return input;
    return (
      <label htmlFor={inputId} className="hx-toggle-label">
        {input}
        <span className="hx-toggle-label__text">{label}</span>
      </label>
    );
  }),
  { displayName: "Toggle" }
);

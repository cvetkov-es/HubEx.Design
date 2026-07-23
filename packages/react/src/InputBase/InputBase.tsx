import * as React from "react";

/**
 * Official DS: `InputBaseProps.leftIcon` is typed as an SVG render prop
 * (`(props: SVGProps<SVGSVGElement>) => ReactElement) | null`). This package
 * is Material-font-based and never bundles inline SVG (see the ban documented
 * on Icon.tsx), so here `leftIcon` is a plain `React.ReactNode` — pass e.g.
 * `<Icon name="search" />` or a bare `<span className="material">search</span>`.
 * This is the same documented-deviation precedent as Button.tsx's icon/endIcon.
 */
export interface InputBaseProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "maxLength" | "role"> {
  name?: string;
  id?: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  errorText?: string;
  /**
   * When true, error border/ARIA still derive from `errorText`, but the
   * message is not rendered inside InputBase (e.g. a consumer like Select
   * renders it outside its own dropdown reference, reusing the same `errorId`).
   */
  hideErrorText?: boolean;
  errorId?: string;
  maxLength?: number;
  leftIcon?: React.ReactNode;
  /** Right side affordance: chevron, clear button, lock, etc. Wrap multiple in your own flex container. */
  rightSlot?: React.ReactNode;
  /**
   * Pixels reserved on the right for `rightSlot`. Default is 36 (one 18px icon
   * column with paddings), matching the official InputBase default.
   */
  rightSlotWidthPx?: number;
  type?: string;
  onFocusChange?: (isFocused: boolean) => void;
  /** Advanced accessibility/interaction props (explicitly forwarded, no props spreading of these). */
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: boolean | "dialog" | "menu" | "listbox" | "grid" | "false" | "true" | "tree";
  ariaActivedescendant?: string;
  ariaAutocomplete?: "none" | "list" | "both";
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const InputBase = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, InputBaseProps>((props, ref) => {
    const {
      name,
      id,
      value,
      onChange,
      placeholder,
      required,
      disabled,
      fullWidth,
      errorText,
      hideErrorText,
      errorId,
      maxLength,
      leftIcon,
      rightSlot,
      rightSlotWidthPx = 36,
      type = "text",
      onFocusChange,
      role,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      ariaControls,
      ariaExpanded,
      ariaHasPopup,
      ariaActivedescendant,
      ariaAutocomplete,
      onFocus,
      onBlur,
      className,
      style,
      ...rest
    } = props;

    const generatedErrorId = React.useId();
    const hasError = Boolean(errorText);
    const resolvedErrorId = hasError ? errorId ?? generatedErrorId : undefined;

    const describedByParts = [ariaDescribedBy, resolvedErrorId].filter(Boolean) as string[];
    const resolvedDescribedBy = describedByParts.length ? describedByParts.join(" ") : undefined;

    const hasLeft = leftIcon != null;
    const hasRight = rightSlot != null;

    function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
      onFocusChange?.(true);
      onFocus?.(event);
    }
    function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
      onFocusChange?.(false);
      onBlur?.(event);
    }

    const wrapCls = ["hx-inputbase-wrap", fullWidth && "hx-inputbase--full"].filter(Boolean).join(" ");
    const inputCls = [
      "hx-inputbase",
      hasError && "hx-inputbase--invalid",
      hasLeft && "hx-inputbase--has-left",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // rightSlotWidthPx is per-instance/dynamic (unlike the fixed 36px left-icon
    // column), so it's reserved via inline style rather than a fixed CSS class —
    // merged with any consumer-supplied `style` so it isn't clobbered.
    const mergedStyle = hasRight ? { ...style, paddingRight: `${rightSlotWidthPx}px` } : style;

    return (
      <div className={wrapCls}>
        <div className="hx-inputbase-control">
          {hasLeft && (
            <span className="hx-inputbase__left" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {/* `...rest` is spread FIRST; every controlled attribute below is set
              AFTER so it can never be silently clobbered by a same-named prop
              passed through native HTML attributes (see Button.tsx). */}
          <input
            {...rest}
            ref={ref}
            name={name}
            id={id}
            role={role}
            type={type}
            className={inputCls}
            style={mergedStyle}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={hasError || undefined}
            {...(resolvedDescribedBy !== undefined ? { "aria-describedby": resolvedDescribedBy } : {})}
            {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
            {...(ariaLabelledBy !== undefined ? { "aria-labelledby": ariaLabelledBy } : {})}
            {...(ariaControls !== undefined ? { "aria-controls": ariaControls } : {})}
            {...(ariaExpanded !== undefined ? { "aria-expanded": ariaExpanded } : {})}
            {...(ariaHasPopup !== undefined ? { "aria-haspopup": ariaHasPopup } : {})}
            {...(ariaActivedescendant !== undefined ? { "aria-activedescendant": ariaActivedescendant } : {})}
            {...(ariaAutocomplete !== undefined ? { "aria-autocomplete": ariaAutocomplete } : {})}
          />
          {hasRight && <span className="hx-inputbase__right">{rightSlot}</span>}
        </div>
        {hasError && !hideErrorText && (
          <span id={resolvedErrorId} className="hx-inputbase__error">
            {errorText}
          </span>
        )}
      </div>
    );
  }),
  { displayName: "InputBase" }
);

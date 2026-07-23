import * as React from "react";

/**
 * Official DS: `InputProps.type` (Input.types.d.ts). Password visibility
 * toggling is out of scope for this port (no ground-truth eye icon geometry
 * yet); `type="password"` still just renders a native password field.
 */
export type InputType = "text" | "password" | "email" | "tel" | "url" | "search" | "number";

/**
 * Explicit public API fields (Input.types.d.ts) layered on top of the plain
 * `InputHTMLAttributes` extends this package has always kept (house
 * deviation from the official "no props spreading" component -- see
 * Button.tsx's own icon/endIcon deviation note for the same house-style
 * precedent of documented, intentional API drift).
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  type?: InputType;
  label?: string;
  errorText?: string;
  errorId?: string;
  allowClear?: boolean;
  textLimit?: number;
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Legacy (0.1.x/0.2.x) back-compat alias: drives the same error styling as `errorText` presence. */
  invalid?: boolean;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Input = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
      type = "text",
      label,
      errorText,
      errorId,
      allowClear,
      textLimit,
      fullWidth,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      ariaControls,
      ariaExpanded,
      invalid,
      className,
      id,
      value,
      defaultValue,
      disabled,
      readOnly,
      onChange,
      maxLength,
      ...rest
    } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    // Tracks the *current* text so `allowClear` knows whether to render the
    // clear affordance for both controlled (`value`) and uncontrolled
    // (`defaultValue`) usage -- kept in sync with the `value` prop on every
    // controlled update via the effect below.
    const [currentText, setCurrentText] = React.useState<string>(() =>
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ""
    );
    React.useEffect(() => {
      if (value !== undefined) setCurrentText(String(value));
    }, [value]);

    const generatedLabelId = React.useId();
    const inputId = id ?? (label ? generatedLabelId : undefined);

    const generatedErrorId = React.useId();
    const hasError = Boolean(invalid) || Boolean(errorText);
    const resolvedErrorId = errorText ? errorId ?? generatedErrorId : undefined;

    const describedByParts = [ariaDescribedBy, resolvedErrorId].filter(Boolean) as string[];
    const resolvedDescribedBy = describedByParts.length ? describedByParts.join(" ") : undefined;

    const showClear = Boolean(allowClear) && !disabled && !readOnly && currentText.length > 0;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      setCurrentText(event.target.value);
      onChange?.(event);
    }

    // Clearing dispatches a real native "input" event (via the native value
    // setter) rather than calling `onChange` directly with a hand-built
    // event object: React's synthetic event system listens for the native
    // event, so this produces a real ChangeEvent (event.target.value === "")
    // for the consumer's onChange, and also updates the DOM value in place
    // for uncontrolled usage where no parent re-render would otherwise sync it.
    function handleClear() {
      const node = inputRef.current;
      if (node) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(node, "");
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.focus();
      } else {
        setCurrentText("");
      }
    }

    const inputCls = [
      "hx-input",
      hasError && "hx-input--invalid",
      showClear && "hx-input--clearable",
      className
    ]
      .filter(Boolean)
      .join(" ");

    const wrapCls = ["hx-input-wrap", fullWidth && "hx-input--full"].filter(Boolean).join(" ");

    return (
      <div className={wrapCls}>
        {label && (
          <label className="hx-label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="hx-input-control">
          {/* `...rest` is spread FIRST; every controlled attribute below is set
              AFTER so it can never be silently clobbered by a same-named prop
              passed through native HTML attributes (see Button.tsx). */}
          <input
            {...rest}
            ref={setRefs}
            id={inputId}
            type={type}
            className={inputCls}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={textLimit ?? maxLength}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            {...(resolvedDescribedBy !== undefined ? { "aria-describedby": resolvedDescribedBy } : {})}
            {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
            {...(ariaLabelledBy !== undefined ? { "aria-labelledby": ariaLabelledBy } : {})}
            {...(ariaControls !== undefined ? { "aria-controls": ariaControls } : {})}
            {...(ariaExpanded !== undefined ? { "aria-expanded": ariaExpanded } : {})}
          />
          {showClear && (
            <button
              type="button"
              className="hx-input__clear"
              aria-label="Clear"
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
            >
              <span className="material" aria-hidden="true">
                close
              </span>
            </button>
          )}
        </div>
        {errorText && (
          <span id={resolvedErrorId} className="hx-input__error">
            {errorText}
          </span>
        )}
      </div>
    );
  }),
  { displayName: "Input" }
);

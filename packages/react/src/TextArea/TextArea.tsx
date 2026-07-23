import * as React from "react";

// Fallback row height used only when `getComputedStyle(node).lineHeight`
// isn't a resolvable pixel value (e.g. "normal" -- the default under jsdom
// tests with no stylesheet loaded, or before layout has run). Once a real
// stylesheet is present, the actual computed line-height is used instead.
const FALLBACK_LINE_HEIGHT_PX = 20;

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textLimit?: number;
  errorText?: string;
  /** When true, shows a clear (x) button whenever the field has a value. */
  allowClear?: boolean;
  /** When true, height grows and shrinks with the text. Uses `resize: none`. */
  autoSize?: boolean;
  /** With `autoSize`, caps height (~rows); extra content scrolls inside the field. */
  maxRows?: number;
}

function resolveLineHeightPx(node: HTMLTextAreaElement): number {
  const parsed = parseFloat(window.getComputedStyle(node).lineHeight);
  return Number.isFinite(parsed) ? parsed : FALLBACK_LINE_HEIGHT_PX;
}

// Imperative DOM mutation (not a React-controlled `style.height`) so it
// survives re-renders without React's own style diffing clobbering it --
// mirrors Input.tsx's allowClear pattern of reaching for the native node
// directly rather than routing everything through React state.
function autoSizeNode(node: HTMLTextAreaElement, maxRows: number | undefined) {
  node.style.height = "auto"; // reset first so scrollHeight reflects a shrink, not just growth
  let next = node.scrollHeight;
  if (maxRows) {
    const cap = resolveLineHeightPx(node) * maxRows;
    next = Math.min(next, cap);
  }
  node.style.height = `${next}px`;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const TextArea = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
    const {
      label,
      textLimit,
      errorText,
      allowClear,
      autoSize,
      maxRows,
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

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    // Tracks the *current* text so `allowClear`/the counter know the live
    // length for both controlled (`value`) and uncontrolled (`defaultValue`)
    // usage -- same idiom as Input.tsx's `currentText`.
    const [currentText, setCurrentText] = React.useState<string>(() =>
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ""
    );
    React.useEffect(() => {
      if (value !== undefined) setCurrentText(String(value));
    }, [value]);

    // Sizes once on mount (and whenever autoSize/maxRows toggle) so an
    // initial multi-line defaultValue/value isn't left clipped until the
    // first keystroke. `value` is also a dep so a controlled consumer that
    // changes the text programmatically (loading a draft, a form reset --
    // i.e. NOT via this textarea's own onChange) still gets a resize; the
    // on-keystroke (handleChange) and handleClear paths already resize
    // synchronously, so for controlled fields this effect just re-confirms
    // the same height post-render, which is redundant but not looping
    // (autoSizeNode never triggers a state update).
    React.useLayoutEffect(() => {
      if (!autoSize) return;
      const node = textareaRef.current;
      if (node) autoSizeNode(node, maxRows);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSize, maxRows, value]);

    const generatedLabelId = React.useId();
    const textareaId = id ?? (label ? generatedLabelId : undefined);

    const generatedErrorId = React.useId();
    const hasError = Boolean(errorText);
    const resolvedErrorId = hasError ? generatedErrorId : undefined;

    const showClear = Boolean(allowClear) && !disabled && !readOnly && currentText.length > 0;
    const showCounter = Boolean(textLimit);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      setCurrentText(event.target.value);
      if (autoSize) autoSizeNode(event.target, maxRows);
      onChange?.(event);
    }

    // Clearing dispatches a real native "input" event (via the native value
    // setter), same idiom as Input.tsx's `handleClear` -- see that file's
    // comment for why this is preferred over calling `onChange` with a
    // hand-built event object.
    function handleClear() {
      const node = textareaRef.current;
      if (node) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        setter?.call(node, "");
        node.dispatchEvent(new Event("input", { bubbles: true }));
        if (autoSize) autoSizeNode(node, maxRows);
        node.focus();
      } else {
        setCurrentText("");
      }
    }

    const textareaCls = [
      "hx-textarea",
      hasError && "hx-textarea--invalid",
      autoSize && "hx-textarea--autosize",
      showClear && "hx-textarea--clearable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="hx-textarea-wrap">
        {label && (
          <label className="hx-label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <div className="hx-textarea-control">
          {/* `...rest` is spread FIRST; every controlled attribute below is set
              AFTER so it can never be silently clobbered by a same-named prop
              passed through native HTML attributes (see Button.tsx). */}
          <textarea
            {...rest}
            ref={setRefs}
            id={textareaId}
            className={textareaCls}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={textLimit ?? maxLength}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            {...(resolvedErrorId !== undefined ? { "aria-describedby": resolvedErrorId } : {})}
          />
          {showClear && (
            <button
              type="button"
              className="hx-textarea__clear"
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
          {showCounter && (
            <span className="hx-textarea__counter">
              {currentText.length}/{textLimit}
            </span>
          )}
        </div>
        {hasError && (
          <span id={resolvedErrorId} className="hx-textarea__error">
            {errorText}
          </span>
        )}
      </div>
    );
  }),
  { displayName: "TextArea" }
);

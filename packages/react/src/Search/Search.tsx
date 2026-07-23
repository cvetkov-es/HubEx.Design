import * as React from "react";
import { InputBase } from "../InputBase/InputBase";

export interface SearchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "maxLength" | "required" | "disabled"
  > {
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  errorText?: string;
  name?: string;
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
//
// Built on InputBase (this component runs at RUNTIME, not just types — see
// treeshake.test.mjs's Search isolation guard, which asserts a Search-only
// bundle legitimately contains `hx-inputbase`).
export const Search = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, SearchProps>((props, ref) => {
    const { value, onChange, placeholder, fullWidth, errorText, name, ariaLabel, className, ...rest } = props;

    // Mirrors Input.tsx's `allowClear`: clearing dispatches a real native
    // "input" event via the native value setter (rather than calling
    // `onChange` with a hand-built fake event object, which is what the
    // vendored bundle does) so a real ChangeEvent reaches the consumer and
    // uncontrolled DOM state stays in sync.
    const inputRef = React.useRef<HTMLInputElement>(null);
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    const hasValue = value.length > 0;
    // Official: `ariaLabel ?? placeholder ?? "Search"`.
    const resolvedAriaLabel = ariaLabel ?? placeholder ?? "Search";

    function handleClear(event: React.MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      const node = inputRef.current;
      if (node) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(node, "");
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.focus();
      }
    }

    return (
      <InputBase
        {...rest}
        ref={setRefs}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        errorText={errorText}
        fullWidth={fullWidth}
        className={["hx-search", className].filter(Boolean).join(" ")}
        leftIcon={
          <span className="material" aria-hidden="true">
            search
          </span>
        }
        // Official always renders the clear affordance and toggles it via
        // `visibility` (not conditional rendering) so `rightSlotWidthPx`
        // stays constant instead of causing layout shift when a value is
        // typed/cleared.
        rightSlot={
          <button
            type="button"
            className="hx-search__clear"
            aria-label="Clear"
            aria-hidden={!hasValue}
            tabIndex={hasValue ? 0 : -1}
            style={{ visibility: hasValue ? "visible" : "hidden" }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            <span className="material" aria-hidden="true">
              close
            </span>
          </button>
        }
        ariaLabel={resolvedAriaLabel}
      />
    );
  }),
  { displayName: "Search" }
);

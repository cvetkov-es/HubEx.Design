import * as React from "react";

// Combines the forwarded ref with an internally-owned ref so the component
// can imperatively read/write the DOM node (needed for `indeterminate`,
// below) while still handing the node to whatever ref the caller passed.
function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /**
   * Official DS field. `indeterminate` has no HTML attribute / React prop
   * equivalent -- the DOM-only `.indeterminate` property is set imperatively
   * via a merged ref in a `useEffect` below (whenever this prop changes).
   */
  indeterminate?: boolean;
  /** Accessible name override; also settable via the native `aria-label` attribute. */
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Checkbox = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
    const { label, className, id, indeterminate, ariaLabel, ...rest } = props;
    const generatedId = React.useId();
    const inputId = id ?? (label ? generatedId : undefined);
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    // Stable identity across renders -- without this, a new callback ref is
    // created every render, causing React to detach/reattach the DOM node's
    // refs (and re-run any ref callbacks the caller passed) on every render.
    const mergedRef = React.useCallback(mergeRefs(ref, innerRef), [ref]);

    const cls = ["hx-checkbox", indeterminate && "hx-checkbox--indeterminate", className]
      .filter(Boolean)
      .join(" ");

    // `...rest` is spread FIRST; every controlled attribute below (type, id,
    // className, aria-label) is set AFTER so it can never be silently
    // clobbered by a same-named prop the caller passed through native HTML
    // attributes (see Button.tsx for the full rationale).
    const input = (
      <input
        {...rest}
        ref={mergedRef}
        type="checkbox"
        id={inputId}
        className={cls}
        {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      />
    );
    if (!label) return input;
    return (
      <label htmlFor={inputId}>
        {input} {label}
      </label>
    );
  }),
  { displayName: "Checkbox" }
);

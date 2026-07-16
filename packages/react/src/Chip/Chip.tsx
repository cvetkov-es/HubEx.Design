import * as React from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Chip = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, ChipProps>(
    ({ onRemove, className, children, ...rest }, ref) => {
      const cls = ["hx-chip", className].filter(Boolean).join(" ");
      return (
        <span {...rest} ref={ref} className={cls}>
          {children}
          {onRemove && (
            <button
              type="button"
              className="hx-chip__remove"
              aria-label="Remove"
              onClick={onRemove}
            >
              ×
            </button>
          )}
        </span>
      );
    }
  ),
  { displayName: "Chip" }
);

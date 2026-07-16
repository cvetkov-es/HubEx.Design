import * as React from "react";
import { createPortal } from "react-dom";

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Drawer = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, DrawerProps>(
    ({ open, onClose, side = "right", children, className, ...rest }, ref) => {
      React.useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
      }, [open, onClose]);

      if (!open) return null;

      const cls = ["hx-drawer", `hx-drawer--${side}`, className].filter(Boolean).join(" ");
      return createPortal(
        <div
          className="hx-drawer__backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div {...rest} className={cls} role="dialog" aria-modal="true" ref={ref}>
            {children}
          </div>
        </div>,
        document.body
      );
    }
  ),
  { displayName: "Drawer" }
);

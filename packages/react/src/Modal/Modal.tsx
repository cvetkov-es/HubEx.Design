import * as React from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Modal = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, ModalProps>(
    ({ open, onClose, title, children, className }, ref) => {
      React.useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
      }, [open, onClose]);

      if (!open) return null;

      const cls = ["hx-modal", className].filter(Boolean).join(" ");
      return createPortal(
        <div
          className="hx-modal__backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className={cls} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
            {title && <h2 className="hx-modal__title">{title}</h2>}
            <div className="hx-modal__body">{children}</div>
          </div>
        </div>,
        document.body
      );
    }
  ),
  { displayName: "Modal" }
);

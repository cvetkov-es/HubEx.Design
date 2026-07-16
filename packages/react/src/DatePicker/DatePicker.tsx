import * as React from "react";
import { createPortal } from "react-dom";
import { Input } from "../Input/Input";
import { Calendar } from "../Calendar/Calendar";

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "readOnly"> {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(d: Date): string {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
// The trigger is the existing Input component (readOnly — the date is only
// ever set by picking a day), and the Calendar popover is rendered into a
// portal positioned from the trigger's measured bounding box, reusing the
// same portal + outside-click + Escape pattern as Menu.tsx.
export const DatePicker = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ value, onChange, placeholder, className, onClick, ...rest }, ref) => {
      const [open, setOpen] = React.useState(false);
      const [position, setPosition] = React.useState({ top: 0, left: 0 });
      const triggerRef = React.useRef<HTMLInputElement>(null);
      const popoverRef = React.useRef<HTMLDivElement>(null);

      const setRefs = React.useCallback(
        (node: HTMLInputElement | null) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        },
        [ref]
      );

      React.useEffect(() => {
        if (!open) return;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) setPosition({ top: rect.bottom, left: rect.left });
      }, [open]);

      React.useEffect(() => {
        if (!open) return;
        const onOutsideDown = (event: MouseEvent) => {
          const target = event.target as Node;
          if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
          setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onOutsideDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
          document.removeEventListener("mousedown", onOutsideDown);
          document.removeEventListener("keydown", onKeyDown);
        };
      }, [open]);

      const cls = ["hx-datepicker", className].filter(Boolean).join(" ");

      return (
        <>
          <Input
            {...rest}
            ref={setRefs}
            type="text"
            readOnly
            className={cls}
            value={value ? formatDate(value) : ""}
            placeholder={placeholder}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={(event) => {
              onClick?.(event);
              setOpen((was) => !was);
            }}
          />
          {open &&
            createPortal(
              <div
                className="hx-datepicker__popover"
                ref={popoverRef}
                style={{ position: "fixed", top: position.top, left: position.left }}
              >
                <Calendar
                  value={value}
                  month={value}
                  onChange={(date) => {
                    onChange(date);
                    setOpen(false);
                  }}
                />
              </div>,
              document.body
            )}
        </>
      );
    }
  ),
  { displayName: "DatePicker" }
);

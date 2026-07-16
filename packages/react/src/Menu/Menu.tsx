import * as React from "react";
import { createPortal } from "react-dom";

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

export interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  className?: string;
}

// Plain named function component (no forwardRef) — see Table.tsx for why
// naming the function is sufficient to get a correct displayName without a
// separate `Menu.displayName = "Menu"` side-effect statement. The item list
// is rendered into a portal (like Modal/Drawer) so it can escape any
// overflow:hidden ancestor of the trigger, positioned via the trigger's
// measured bounding box.
export function Menu({ trigger, items, className }: MenuProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom, left: rect.left });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onOutsideDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (listRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
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

  const cls = ["hx-menu", className].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        className="hx-menu__trigger"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <ul
            className={cls}
            role="menu"
            ref={listRef}
            style={{ position: "fixed", top: position.top, left: position.left }}
          >
            {items.map((item, index) => (
              <li key={`${item.label}-${index}`} role="none" className="hx-menu__item-wrap">
                <button
                  type="button"
                  role="menuitem"
                  className="hx-menu__item"
                  onClick={() => {
                    item.onSelect();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}

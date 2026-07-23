import * as React from "react";

// Official DS uses `Placement` from `@floating-ui/react` (12 values incl.
// "top-start", "right-end", etc). This package never depends on floating-ui —
// positioning is CSS-only via a `.hx-popover--<placement>` modifier class —
// so PopoverPlacement is narrowed to the 4 cardinal directions the CSS
// actually implements (same narrowing Tooltip already made in Task 7).
export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export type PopoverSize = "m" | "l";

export type PopoverTrigger = "click" | "hover" | "click-hover";

// DEFAULT_CLOSE_DELAY matches the official bundle's own fallback (150ms) for
// both the hover-close delay and the closeOnPointerLeave grace period.
const DEFAULT_CLOSE_DELAY = 150;

function resolveDelay(
  hoverDelay: number | { open?: number; close?: number } | undefined,
  which: "open" | "close"
): number {
  if (typeof hoverDelay === "number") return hoverDelay;
  if (hoverDelay && typeof hoverDelay === "object") {
    const value = hoverDelay[which];
    if (typeof value === "number") return value;
  }
  return which === "close" ? DEFAULT_CLOSE_DELAY : 0;
}

export interface PopoverProps {
  /** Panel content (text or any React node). */
  content: React.ReactNode;
  /** Single trigger element; cloned so open/close handlers attach directly to it. */
  children: React.ReactElement<Record<string, unknown>>;
  /** @default 'bottom' */
  placement?: PopoverPlacement;
  /** @default 'click' */
  trigger?: PopoverTrigger;
  /**
   * Delay (ms) applied to hover open/close. A single number covers both; an
   * object can set `open`/`close` independently. Also used as the
   * `closeOnPointerLeave` grace period (falls back to 150ms, matching the
   * official default).
   */
  hoverDelay?: number | { open?: number; close?: number };
  /**
   * click-mode only: also close when the pointer leaves BOTH the trigger and
   * the panel (after the close delay). Ignored for 'hover'/'click-hover' —
   * there the hover trigger itself already handles pointer-leave.
   * @default false
   */
  closeOnPointerLeave?: boolean;
  /** @default 'm' */
  size?: PopoverSize;
  maxWidth?: number | string;
  maxHeight?: number | string;
  /** Controlled open state (paired with `onOpenChange`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  /**
   * INTERNAL EXTENSION — not part of the official Popover API (which fixes
   * the panel's role to "dialog"). Dropdown/Info reuse this Popover
   * implementation as their positioning/open-state engine and need to put
   * their own role (menu/listbox/"none"→no attribute/etc.) on the SAME panel
   * element rather than nesting a second role-bearing wrapper inside it.
   * `undefined` (default) keeps the official "dialog"; `null` omits the role
   * attribute entirely.
   * @default 'dialog'
   */
  role?: string | null;
  /**
   * INTERNAL EXTENSION — not part of the official Popover API. Extra class
   * name(s) merged onto the panel element, after the built-in
   * `hx-popover*` classes. Lets Dropdown/Info add their own `hx-dropdown` /
   * `hx-info__panel` class to the same physical panel Popover renders,
   * instead of wrapping it in an extra `<div>`.
   */
  panelClassName?: string;
}

// Popover is a plain named function component (no forwardRef) — same
// precedent as Tooltip: `children` is a single arbitrary trigger element
// that gets cloned so handlers attach directly to it, and there is no single
// unambiguous DOM node a forwarded ref could point to (the trigger? the
// panel?). See Tooltip.tsx for the fuller rationale.
//
// OMITTED vs. the official (floating-ui-based) Popover — documented here per
// the Task 10 brief, each omission deliberate:
//  - `fallbackPlacements` / auto-flip: floating-ui's `flip()` middleware picks
//    a working placement when the requested one would overflow the viewport.
//    We only support the single static `placement` the caller passes — no
//    collision detection, no runtime placement switching.
//  - `portalContainer` / portals: the official panel renders in a React
//    portal (via `createPortal`) so it can escape `overflow:hidden`
//    ancestors and stack above everything via a fixed/floating position. We
//    render the panel as a normal DOM child of a `position: relative`
//    wrapper, absolutely positioned within it — it can be clipped by an
//    ancestor's `overflow: hidden` and does not escape stacking contexts.
//  - Collision/arrow positioning: floating-ui's `arrow()` middleware computes
//    exact arrow offsets against the measured overlap; without floating-ui
//    there is no reliable geometry to place an arrow against, so this
//    implementation renders NO arrow/caret at all (Tooltip's static 4-corner
//    arrow works there because Tooltip has no `size`/`maxWidth` variability;
//    Popover's panel can be arbitrarily large, so a fixed-offset arrow would
//    frequently misalign).
export function Popover({
  content,
  children,
  placement = "bottom",
  trigger = "click",
  hoverDelay,
  closeOnPointerLeave = false,
  size = "m",
  maxWidth,
  maxHeight,
  open,
  onOpenChange,
  disabled = false,
  ariaLabel,
  ariaLabelledBy,
  role = "dialog",
  panelClassName,
}: PopoverProps) {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const visible = isControlled ? Boolean(open) : uncontrolledOpen;

  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimer.current != null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      clearCloseTimer();
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange, clearCloseTimer]
  );

  const supportsHover = trigger === "hover" || trigger === "click-hover";
  const supportsClick = trigger === "click" || trigger === "click-hover";

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  // Escape closes for click/hover/click-hover, but NOT for an unrecognized
  // trigger value like Dropdown's 'manual' — that mode opts out of all
  // built-in open/close wiring, visibility is driven exclusively by the
  // controlled `open` prop, and Escape auto-closing would silently override
  // that contract.
  React.useEffect(() => {
    if (!visible || disabled || !(supportsClick || supportsHover)) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, disabled, supportsClick, supportsHover, setOpen]);

  // Click-outside closes click-mode popovers (no portal, so this checks
  // against the whole wrapper — trigger + panel — via a single ref).
  React.useEffect(() => {
    if (!visible || disabled || !supportsClick) return;
    const onOutsideDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onOutsideDown);
    return () => document.removeEventListener("mousedown", onOutsideDown);
  }, [visible, disabled, supportsClick, setOpen]);

  const scheduleClose = React.useCallback(
    (delayMs: number) => {
      clearCloseTimer();
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null;
        setOpen(false);
      }, delayMs);
    },
    [clearCloseTimer, setOpen]
  );

  const openNow = React.useCallback(() => {
    clearCloseTimer();
    if (disabled) return;
    setOpen(true);
  }, [clearCloseTimer, disabled, setOpen]);

  const childProps = children.props;
  const trigger_ = React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      (childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(event);
      if (!supportsClick || disabled) return;
      setOpen(!visible);
    },
    onMouseEnter: (event: React.MouseEvent) => {
      (childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(event);
      if (supportsHover) {
        clearCloseTimer();
        if (!disabled) {
          const delay = resolveDelay(hoverDelay, "open");
          if (delay > 0) {
            closeTimer.current = setTimeout(() => {
              closeTimer.current = null;
              setOpen(true);
            }, delay);
          } else {
            setOpen(true);
          }
        }
      } else if (supportsClick && closeOnPointerLeave && visible) {
        clearCloseTimer();
      }
    },
    onMouseLeave: (event: React.MouseEvent) => {
      (childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(event);
      if (supportsHover) {
        scheduleClose(resolveDelay(hoverDelay, "close"));
      } else if (supportsClick && closeOnPointerLeave && visible) {
        scheduleClose(resolveDelay(hoverDelay, "close"));
      }
    },
    onFocus: (event: React.FocusEvent) => {
      (childProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(event);
      if (supportsHover) openNow();
    },
    onBlur: (event: React.FocusEvent) => {
      (childProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(event);
      if (supportsHover) scheduleClose(resolveDelay(hoverDelay, "close"));
    },
  });

  const panelStyle: React.CSSProperties = {};
  if (maxWidth !== undefined) panelStyle.maxWidth = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  if (maxHeight !== undefined) panelStyle.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  // Mouse handlers on the panel: needed both for closeOnPointerLeave
  // (click-mode's opt-in "also close on pointer leaving trigger+panel") and
  // for hover/click-hover, where moving the pointer from the trigger onto
  // the panel must cancel the trigger's pending close timer instead of
  // letting it fire under the user.
  const panelMouseHandlers =
    supportsHover || (supportsClick && closeOnPointerLeave)
      ? {
          onMouseEnter: clearCloseTimer,
          onMouseLeave: () => scheduleClose(resolveDelay(hoverDelay, "close")),
        }
      : undefined;

  // Focus handlers on the panel: only relevant for hover/click-hover, where
  // tabbing focus into interactive panel content must cancel the close timer
  // the same way hovering it does. onBlur only schedules a close if focus is
  // actually leaving the whole popover (trigger + panel) — moving focus
  // between elements inside the panel, or from the panel back to the
  // trigger, must not close it.
  const panelFocusHandlers = supportsHover
    ? {
        onFocus: clearCloseTimer,
        onBlur: (event: React.FocusEvent) => {
          const related = event.relatedTarget as Node | null;
          if (related && wrapRef.current?.contains(related)) return;
          scheduleClose(resolveDelay(hoverDelay, "close"));
        },
      }
    : undefined;

  const panelHandlers =
    panelMouseHandlers || panelFocusHandlers
      ? { ...panelMouseHandlers, ...panelFocusHandlers }
      : undefined;

  return (
    <span className="hx-popover-wrap" ref={wrapRef}>
      {trigger_}
      {visible && !disabled && (
        <span
          className={[
            "hx-popover",
            `hx-popover--${placement}`,
            `hx-popover--${size}`,
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          role={role === null ? undefined : role}
          style={panelStyle}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...panelHandlers}
        >
          {content}
        </span>
      )}
    </span>
  );
}

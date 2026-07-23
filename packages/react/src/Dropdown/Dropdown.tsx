import * as React from "react";
import { Popover, type PopoverPlacement, type PopoverTrigger } from "../Popover/Popover";

// Same floating-ui -> CSS narrowing as Popover/Tooltip (see Popover.tsx).
export type DropdownPlacement = PopoverPlacement;

export type DropdownTrigger = "click" | "hover" | "click-hover" | "manual";
export type DropdownRole = "menu" | "listbox" | "dialog" | "none";
export type DropdownAriaHasPopup = "menu" | "listbox" | "dialog" | "grid" | "tree" | "true";

export interface DropdownProps {
  /** Trigger element; forwarded to Popover which clones it for open/close handlers. */
  children: React.ReactElement<Record<string, unknown>>;
  /** Menu/list content shown in the panel. */
  content: React.ReactNode;
  /** @default 'bottom' — the official default is 'bottom-start', a floating-ui
   * `-start` alignment variant this CSS-positioned implementation doesn't
   * support (see Popover.tsx's OMITTED list); 'bottom' is the nearest
   * supported placement. */
  placement?: DropdownPlacement;
  /** @default 'click'. 'manual' disables both click and hover open/close
   * handling entirely — visibility is driven exclusively by the `open` prop. */
  trigger?: DropdownTrigger;
  /** ARIA role applied to the panel. @default 'menu' */
  role?: DropdownRole;
  /** aria-haspopup value for the trigger. Defaults to `role` (or 'dialog' when role='none'). */
  ariaHasPopup?: DropdownAriaHasPopup;
  /** Set aria-haspopup/aria-expanded on the trigger. @default true */
  applyTriggerAria?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  minWidth?: number | string;
  maxHeight?: number | string;
}

// Plain named function component — same rationale as Popover/Tooltip: the
// single arbitrary trigger element is cloned, so there's no one DOM node a
// forwarded ref could unambiguously point to.
//
// Built entirely on Popover (this package's CSS-positioned base overlay) —
// inherits every omission documented there (no auto-flip/fallbackPlacements,
// no portal, no arrow). Dropdown-specific deviations from the official API:
//  - `placement` is narrowed to the 4 cardinal directions (no '-start'/'-end'
//    alignment variants), so the default is 'bottom' rather than 'bottom-start'.
//  - `matchTriggerWidth` and `portalContainer` are OMITTED (portalContainer
//    for the same no-portal reason as Popover; matchTriggerWidth requires
//    measuring the trigger's live layout width, which is easy to add later
//    but out of scope for this CSS-positioned pass).
export function Dropdown({
  children,
  content,
  placement = "bottom",
  trigger = "click",
  role = "menu",
  ariaHasPopup,
  applyTriggerAria = true,
  open,
  onOpenChange,
  disabled = false,
  ariaLabel,
  ariaLabelledBy,
  minWidth,
  maxHeight,
}: DropdownProps) {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const visible = isControlled ? Boolean(open) : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const resolvedHasPopup: DropdownAriaHasPopup = ariaHasPopup ?? (role === "none" ? "dialog" : role);

  const triggerWithAria = applyTriggerAria
    ? React.cloneElement(children, {
        "aria-haspopup": resolvedHasPopup,
        "aria-expanded": visible,
      })
    : children;

  // Popover has no `minWidth` concept of its own (only maxWidth/maxHeight),
  // so `minWidth` is applied via an inline style on a thin wrapper around
  // `content` rather than plumbed through Popover's props.
  const contentNode =
    minWidth !== undefined ? (
      <div style={{ minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth }}>{content}</div>
    ) : (
      content
    );

  return (
    <Popover
      content={contentNode}
      placement={placement}
      // 'manual' is intentionally passed straight through: Popover's
      // click/hover handling only activates for its own 'click'/'click-hover'/
      // 'hover' literals, so an unrecognized value (like 'manual') already
      // falls through to "neither click nor hover" at runtime — no dedicated
      // branch needed. The cast documents that this is deliberate, not a typo.
      trigger={trigger as unknown as PopoverTrigger}
      open={visible}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      maxHeight={maxHeight}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      role={role === "none" ? null : role}
      panelClassName={["hx-dropdown", `hx-dropdown--${placement}`].join(" ")}
      size="m"
    >
      {triggerWithAria}
    </Popover>
  );
}

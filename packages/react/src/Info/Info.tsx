import * as React from "react";
import { Popover, type PopoverPlacement, type PopoverTrigger } from "../Popover/Popover";
import { Icon } from "../Icon/Icon";

// Same floating-ui -> CSS narrowing as Popover/Tooltip (see Popover.tsx).
export type InfoPlacement = PopoverPlacement;
export type InfoTrigger = "click" | "hover" | "click-hover";

const DEFAULT_ARIA_LABEL = "Information"; // official default is the Russian "Информация" —
// translated to English to match this codebase's convention of English-only
// defaults (see Pagination's DEFAULT_PAGINATION_ARIA_LABEL = "Pagination").

export interface InfoProps {
  /** Popover content shown next to the info icon. */
  content: React.ReactNode;
  /** @default 'bottom' */
  placement?: InfoPlacement;
  maxWidth?: number | string;
  maxHeight?: number | string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default 'click' */
  trigger?: InfoTrigger;
  hoverDelay?: number | { open?: number; close?: number };
  closeOnPointerLeave?: boolean;
  /** Accessible name for the icon trigger. @default 'Information' */
  ariaLabel?: string;
  popoverAriaLabel?: string;
  popoverAriaLabelledBy?: string;
}

// Plain named function component — same rationale as Popover/Tooltip/Dropdown:
// while Info DOES fully control its own trigger element (a <button>, unlike
// Popover/Dropdown's arbitrary cloned child), it still delegates rendering of
// that trigger down through Popover's `children` slot, where Popover clones
// whatever it's given — forwarding a ref through two layers of cloneElement
// for marginal benefit isn't worth the complexity here.
//
// DEVIATION from the official API: the official Info renders a bespoke 2px
// SVG "i" glyph (InfoIcon, an inline `<svg>` with two `<path>` elements) as
// the trigger. This package never bundles inline SVG (Material-font-only —
// see the ban documented on Icon.tsx), so the trigger is
// `<Icon name="info"/>` (Material Icons glyph "info") instead.
//
// Built on Popover — inherits every omission documented there (no auto-flip/
// fallbackPlacements, no portal, no arrow). `portalContainer` is likewise
// OMITTED here for the same reason.
export function Info({
  content,
  placement = "bottom",
  maxWidth,
  maxHeight,
  open,
  onOpenChange,
  trigger = "click",
  hoverDelay,
  closeOnPointerLeave = false,
  ariaLabel = DEFAULT_ARIA_LABEL,
  popoverAriaLabel,
  popoverAriaLabelledBy,
}: InfoProps) {
  // Popover's `open` is only the CONTROLLED value (undefined when
  // uncontrolled) — it can't be read back to know current visibility. Info
  // mirrors it into local state via `onOpenChange` (which Popover calls on
  // every open/close, controlled or not) purely so the trigger button can
  // expose `aria-expanded`; this does not change who owns open/close state.
  const [isOpen, setIsOpen] = React.useState(false);
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  return (
    <Popover
      content={<span className="hx-info__content">{content}</span>}
      placement={placement}
      trigger={trigger as PopoverTrigger}
      hoverDelay={hoverDelay}
      closeOnPointerLeave={closeOnPointerLeave}
      size="m"
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabel={popoverAriaLabel}
      ariaLabelledBy={popoverAriaLabelledBy}
    >
      <button
        type="button"
        className="hx-info__trigger"
        aria-label={ariaLabel}
        aria-expanded={open !== undefined ? open : isOpen}
      >
        <Icon name="info" size={16} color="accent" />
      </button>
    </Popover>
  );
}

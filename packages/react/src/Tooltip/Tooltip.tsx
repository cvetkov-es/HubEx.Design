import * as React from "react";

// Official DS uses `Placement` from `@floating-ui/react` (12 values incl.
// "top-start", "right-end", etc). This package never depends on floating-ui —
// positioning is CSS-only via a `.hx-tooltip--<placement>` modifier class — so
// TooltipPlacement is DELIBERATELY narrowed to the 4 cardinal directions the
// CSS actually implements.
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Tooltip text (matches the official API: text only, no rich content). */
  content: string;
  children: React.ReactElement<Record<string, unknown>>;
  /** @default 'bottom' */
  placement?: TooltipPlacement;
}

// Tooltip is a plain named function component (no forwardRef — see Table.tsx
// for why naming the function is sufficient to get a correct displayName
// without a separate `Tooltip.displayName = "Tooltip"` side-effect statement).
// The single child (trigger) is cloned so the show/hide handlers attach
// directly to it rather than to a wrapping element — this keeps hover/focus
// detection exact and avoids an extra DOM node intercepting layout. Shown on
// BOTH hover (mouseenter/mouseleave) AND focus (focus/blur) so keyboard users
// reach the same content a mouse user does.
export function Tooltip({ content, children, placement = "bottom" }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const childProps = children.props;
  const trigger = React.cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent) => {
      (childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(event);
      show();
    },
    onMouseLeave: (event: React.MouseEvent) => {
      (childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(event);
      hide();
    },
    onFocus: (event: React.FocusEvent) => {
      (childProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(event);
      show();
    },
    onBlur: (event: React.FocusEvent) => {
      (childProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(event);
      hide();
    }
  });

  return (
    <span className="hx-tooltip-wrap">
      {trigger}
      {visible && (
        <span className={`hx-tooltip hx-tooltip--${placement}`} role="tooltip">
          {content}
          <span className="hx-tooltip__arrow" />
        </span>
      )}
    </span>
  );
}

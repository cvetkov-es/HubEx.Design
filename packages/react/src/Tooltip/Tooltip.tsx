import * as React from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<Record<string, unknown>>;
}

// Tooltip is a plain named function component (no forwardRef — see Table.tsx
// for why naming the function is sufficient to get a correct displayName
// without a separate `Tooltip.displayName = "Tooltip"` side-effect statement).
// The single child (trigger) is cloned so the show/hide handlers attach
// directly to it rather than to a wrapping element — this keeps hover/focus
// detection exact and avoids an extra DOM node intercepting layout.
export function Tooltip({ content, children }: TooltipProps) {
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
        <span className="hx-tooltip" role="tooltip">
          {content}
          <span className="hx-tooltip__arrow" />
        </span>
      )}
    </span>
  );
}

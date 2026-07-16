import * as React from "react";

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
// Thin span wrapper reusing the existing .hx-label class already used for
// form field labels (see Field.tsx) — same visual, different host element for
// standalone (non-form) inline label text.
export const Label = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, LabelProps>(({ className, ...rest }, ref) => {
    const cls = ["hx-label", className].filter(Boolean).join(" ");
    return <span {...rest} ref={ref} className={cls} />;
  }),
  { displayName: "Label" }
);

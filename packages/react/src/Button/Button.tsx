import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // `danger` is intentionally absent: the re-based Figma design has no red
  // filled button. This union is the compile-time enforcement of that — the
  // type checker rejects `variant="danger"` outright, matching the CSS
  // package, which has already dropped its `.hx-btn--danger` rule.
  variant?: "primary" | "secondary" | "ghost" | "dashed";
  size?: "md" | "sm";
}

// The displayName is attached via Object.assign (rather than a separate
// `Button.displayName = "Button"` statement) so esbuild can tree-shake this
// component away entirely when a consumer imports some other component from
// the barrel: a bare assignment statement referencing an otherwise-unused
// binding is treated as a side effect and defeats dead-code elimination,
// while a /* @__PURE__ */-annotated expression used as the sole initializer
// of an unused binding is safely dropped as a whole.
export const Button = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className, ...rest }, ref) => {
      const cls = ["hx-btn", `hx-btn--${variant}`, size === "sm" && "hx-btn--sm", className]
        .filter(Boolean)
        .join(" ");
      return <button ref={ref} className={cls} {...rest} />;
    }
  ),
  { displayName: "Button" }
);

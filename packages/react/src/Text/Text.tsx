import * as React from "react";

// Official DS: TextProps.variant (Text.types.d.ts). Each variant is a class
// `hx-text--<variant>` whose CSS pulls the four typography sub-tokens for
// that variant (--hx-font-<stem>-size/-weight/-line-height/-family) from
// @cvetkov_es/tokens — see packages/css/src/index.css. Token stems are
// lowercase (--hx-font-h0-size, not -H0-); the class name keeps the official
// mixed-case spelling ("hx-text--font-H0") since that IS the literal class
// the CSS selector matches, only the var() names inside are lowercased.
export type TextVariant =
  | "font-H0"
  | "font-H1"
  | "font-H2"
  | "font-H3"
  | "font-body-regular"
  | "font-body-medium"
  | "font-paragraph-regular"
  | "font-paragraph-medium"
  | "font-tooltip-regular"
  | "font-tooltip-medium"
  | "font-caption-regular";

// Official DS: TextProps.color (Text.types.d.ts). Each maps 1:1 to a
// --hx-color-text-* token via the hx-text--<color> modifier class. Omitting
// `color` omits the modifier class entirely and falls back to the base
// `.hx-text` rule's default (--hx-color-text-primary), matching the official
// bundle's own fallback (`e.colors.text[color] || e.colors.text['color-text-primary']`).
export type TextColor =
  | "color-text-inverse"
  | "color-text-subtle"
  | "color-text-error"
  | "color-text-secondary"
  | "color-text-primary"
  | "color-text-neutral"
  | "color-text-weak"
  | "color-text-accent";

export interface TextProps {
  variant: TextVariant;
  children: React.ReactNode;
  color?: TextColor;
  ellipsis?: boolean;
  /**
   * House convention: NOT part of the official TextProps interface (Text.types.d.ts
   * declares only variant/children/color/ellipsis). Merged onto the rendered <p> so
   * consumers can layer extra utility classes, same as every other component here.
   */
  className?: string;
}

// The official DS ships Text as a bare function component (Text.d.ts:
// `function Text(props): JSX.Element`, no forwardRef). This package
// forwardRefs every exported component instead (house convention — see
// Button.tsx's top comment on why displayName is attached via Object.assign
// rather than a bare assignment: it's required for cross-component
// tree-shaking, and forwardRef is the shape every sibling component uses).
//
// Element choice: the vendored bundle's TextRoot is `n.p` (styled.p) for
// EVERY variant, including the paragraph-* ones — there is no per-variant
// element switch — so this always renders a <p>, never a <span>.
export const Text = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLParagraphElement, TextProps>((props, ref) => {
    const { variant, children, color, ellipsis, className } = props;

    const cls = [
      "hx-text",
      `hx-text--${variant}`,
      color && `hx-text--${color}`,
      ellipsis && "hx-text--ellipsis",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <p ref={ref} className={cls}>
        {children}
      </p>
    );
  }),
  { displayName: "Text" }
);

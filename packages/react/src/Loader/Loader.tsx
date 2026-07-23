import * as React from "react";

// Official DS: Loader.types.d.ts declares LoaderSizeTokens/LoaderColorTokens
// as TypeScript enums; both LoaderProps fields are REQUIRED (no defaults).
// Re-expressed here as string-literal unions with the enums' exact runtime
// values so no separate enum object needs to ship in this package's bundle.
export type LoaderSize = "small" | "medium" | "large";
export type LoaderColor = "color-icon-primary" | "color-icon-secondary" | "color-icon-error";

export interface LoaderProps {
  size: LoaderSize;
  color: LoaderColor;
  /**
   * House convention: NOT part of the official LoaderProps interface
   * (Loader.types.d.ts declares only size/color). Merged onto the rendered
   * <div>, same as every other component here.
   */
  className?: string;
}

// The official bundle renders the Loader as a rotating inline SVG glyph
// (`getLoaderSize` maps size -> {small:12,medium:18,large:48}px, animated via
// a styled-components keyframe: `rotate 1.1s infinite ease`). This package
// never ships inline SVG (see the ban documented on Icon.tsx / Button.tsx's
// `icon` prop), so the Loader is reimplemented as a pure-CSS bordered-ring
// spinner — same 1.1s/ease timing ported verbatim from the vendored
// animation, no SVG, no JS interval/requestAnimationFrame. size/color map
// onto --hx-size-loader-{s,m,l} and --hx-color-icon-{primary,secondary,error}
// via `.hx-loader--<size>`/`.hx-loader--<color>` modifier classes — see
// packages/css/src/index.css.
//
// Official DS ships Loader as a bare function component (Loader.d.ts:
// `function Loader(props): JSX.Element`, no forwardRef); this package
// forwardRefs every exported component instead (house convention, same
// deviation as Text.tsx).
//
// role="status" + aria-label are this package's own addition — the vendored
// bundle's Loader carries no ARIA attributes at all; a bare spinning <div>
// (or SVG) is invisible to assistive tech without them.
export const Loader = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, LoaderProps>((props, ref) => {
    const { size, color, className } = props;

    const cls = ["hx-loader", `hx-loader--${size}`, `hx-loader--${color}`, className]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} className={cls} role="status" aria-label="Loading" />;
  }),
  { displayName: "Loader" }
);

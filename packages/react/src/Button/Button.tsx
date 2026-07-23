import * as React from "react";

// Official DS: 'color-icon-accent' | 'color-icon-secondary' (Button.types.d.ts,
// enum ButtonIconColorTokens). These are the only two values that reach the icon
// span as a color modifier; each maps 1:1 to a --hx-color-icon-* token in CSS.
export type ButtonIconColor = "color-icon-accent" | "color-icon-secondary";

// The official API renamed 'sm'/'md' to 'small'/'medium'. We adopt the new names
// as the primary union but keep the old ones in the type (and at runtime, see
// SIZE_ALIAS below) so existing consumers built against 0.1.x/0.2.x don't break.
export type ButtonSize = "small" | "medium" | "sm" | "md";

const SIZE_ALIAS: Record<string, "small" | "medium"> = {
  small: "small",
  medium: "medium",
  sm: "small",
  md: "medium",
};

function iconSpanClass(color?: ButtonIconColor): string {
  return [
    "material",
    "hx-btn__icon",
    color === "color-icon-accent" && "hx-btn__icon--accent",
    color === "color-icon-secondary" && "hx-btn__icon--secondary",
  ]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // `danger` is intentionally absent: the re-based Figma design has no red
  // filled button. This union is the compile-time enforcement of that — the
  // type checker rejects `variant="danger"` outright, matching the CSS
  // package, which has already dropped its `.hx-btn--danger` rule.
  variant?: "primary" | "secondary" | "ghost" | "dashed";
  size?: ButtonSize;
  /** Renders a circular icon button (--hx-size-button-circle-s/m instead of the pill). */
  round?: boolean;
  /** Replaces the button's content with a spinner and disables interaction. */
  loading?: boolean;
  /** Stretches the button to 100% of its container (ignored when `round`). */
  fullWidth?: boolean;
  /**
   * Error message. Recolors the Dashed variant's border to the error token (the
   * only variant the official bundle actually re-themes on `error`) and renders
   * a caption-sized message below the button.
   */
  error?: string;
  /**
   * DEVIATION from the official API: the official `icon`/`endIcon` are SVG
   * render props (`(props: SVGProps<SVGSVGElement>) => ReactElement`). This
   * package is Material-font-based and never bundles inline SVG (see the ban
   * documented on `Icon.tsx`), so here `icon`/`endIcon` are Material Icons
   * glyph *names* (e.g. "check", "arrow_forward"), rendered as
   * `<span class="material">{name}</span>` — never an SVG element.
   */
  icon?: string;
  endIcon?: string;
  /** Token for the icon color. Ignored when `icon`/`endIcon` are absent. */
  iconColor?: ButtonIconColor;
  /** Accessible name override; also settable via the native `aria-label` attribute. */
  ariaLabel?: string;
}

// The displayName is attached via Object.assign (rather than a separate
// `Button.displayName = "Button"` statement) so esbuild can tree-shake this
// component away entirely when a consumer imports some other component from
// the barrel: a bare assignment statement referencing an otherwise-unused
// binding is treated as a side effect and defeats dead-code elimination,
// while a /* @__PURE__ */-annotated expression used as the sole initializer
// of an unused binding is safely dropped as a whole.
export const Button = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const {
      variant = "primary",
      size = "medium",
      round,
      loading,
      fullWidth,
      error,
      icon,
      endIcon,
      iconColor,
      ariaLabel,
      className,
      disabled,
      children,
      ...rest
    } = props;

    const resolvedSize = SIZE_ALIAS[size] ?? "medium";
    const isSmall = resolvedSize === "small";

    const cls = [
      "hx-btn",
      `hx-btn--${variant}`,
      isSmall && "hx-btn--sm",
      round && "hx-btn--round",
      fullWidth && "hx-btn--full",
      loading && "hx-btn--loading",
      error && "hx-btn--error",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        {/* `...rest` is spread FIRST; every controlled attribute below (className,
            disabled, aria-busy, aria-invalid) is set AFTER so it can never be
            silently clobbered by a same-named prop the caller passed through
            native HTML attributes. `aria-label` is the one exception: it is only
            added when the `ariaLabel` prop is actually set, so a plain native
            `aria-label` passed via `...rest` still comes through untouched when
            the caller didn't opt into the controlled prop. */}
        <button
          {...rest}
          ref={ref}
          className={cls}
          disabled={Boolean(disabled) || Boolean(loading)}
          aria-busy={loading || undefined}
          aria-invalid={error ? true : undefined}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        >
          {icon && (
            <span aria-hidden="true" className={iconSpanClass(iconColor)}>
              {icon}
            </span>
          )}
          {children != null && <span className="hx-btn__label">{children}</span>}
          {endIcon && (
            <span aria-hidden="true" className={iconSpanClass(iconColor)}>
              {endIcon}
            </span>
          )}
        </button>
        {error && <span className="hx-btn__error">{error}</span>}
      </>
    );
  }),
  { displayName: "Button" }
);

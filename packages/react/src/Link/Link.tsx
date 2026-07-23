import * as React from "react";
import type { TextColor, TextVariant } from "../Text/Text";

export interface LinkProps {
  variant?: TextVariant;
  color?: TextColor;
  ellipsis?: boolean;
  children: React.ReactNode;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
  ariaLabel?: string;
  dataID?: string;
  /**
   * House convention: NOT part of the official LinkProps interface (Link.types.d.ts
   * has no className field). Merged onto the rendered <a>, same as every other
   * component here.
   */
  className?: string;
}

// Official DS ships Link as forwardRef<HTMLAnchorElement> already (Link.d.ts),
// unlike Text/Loader — no deviation needed here for the house pattern.
export const Link = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    const {
      variant = "font-body-regular",
      color,
      ellipsis,
      children,
      href,
      target,
      rel,
      external,
      onClick,
      disabled = false,
      ariaLabel,
      dataID,
      className,
    } = props;

    // Ported verbatim from the vendored bundle's Link function (`H`): `external`
    // forces target="_blank" even over an explicit `target` prop; an explicit
    // `rel` always wins, otherwise `rel` defaults to "noopener noreferrer"
    // whenever the resolved target is "_blank".
    const resolvedTarget = external ? "_blank" : target;
    const resolvedRel = rel ?? (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);

    // Ported verbatim from the vendored bundle's LinkRoot (`G`): disabled ALWAYS
    // forces color-text-subtle, even over an explicit `color` prop
    // (`Q = s ? "color-text-subtle" : color ?? "color-text-accent"`).
    const resolvedColor: TextColor = disabled ? "color-text-subtle" : (color ?? "color-text-accent");

    // Ported verbatim: a disabled Link swallows the click (preventDefault +
    // stopPropagation) and never invokes the caller's onClick.
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      },
      [disabled, onClick]
    );

    // Typography/color/truncation are shared 1:1 with Text's own modifier
    // classes (hx-text--<variant>/<color>/--ellipsis) — the official DS
    // composes Link's styling directly off TextProps, so this package reuses
    // the exact same CSS rules rather than duplicating them under a second
    // `.hx-link--*` namespace.
    const cls = [
      "hx-link",
      `hx-text--${variant}`,
      `hx-text--${resolvedColor}`,
      ellipsis && "hx-text--ellipsis",
      disabled && "hx-link--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <a
        ref={ref}
        // A disabled anchor with no href loses its implicit link semantics in
        // the accessibility tree; the official bundle explicitly restores
        // role="link" in that case (ported verbatim).
        {...(disabled ? { role: "link" } : {})}
        href={disabled ? undefined : href}
        target={disabled ? undefined : resolvedTarget}
        rel={disabled ? undefined : resolvedRel}
        onClick={handleClick}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        aria-label={ariaLabel}
        data-id={dataID}
        className={cls}
      >
        {children}
      </a>
    );
  }),
  { displayName: "Link" }
);

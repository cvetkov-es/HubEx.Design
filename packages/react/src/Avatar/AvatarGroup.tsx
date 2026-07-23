import * as React from "react";
import { Avatar, type AvatarProps } from "./Avatar";

export type AvatarGroupSize = "l" | "m" | "s";

// `Omit<AvatarProps, "size" | "id">`: AvatarProps extends the native
// `HTMLAttributes<HTMLSpanElement>`, which already types `id` as
// `string | undefined` — the official `AvatarGroupItem.id?: string | number`
// would otherwise be an incompatible override, so the native `id` is dropped
// here in favour of the wider official type.
export interface AvatarGroupItem extends Omit<AvatarProps, "size" | "id"> {
  /** Stable key for the item; falls back to array index when omitted. */
  id?: string | number;
}

export interface AvatarGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  avatars: AvatarGroupItem[];
  /** @default 'l' */
  size?: AvatarGroupSize;
  /** @default 3 */
  maxVisible?: number;
  ariaLabel?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
//
// Avatar itself only exposes two physical sizes ("sm"/"md" — see Avatar.tsx,
// unchanged by Task 7). AvatarGroup's three-size official API (l/m/s) is
// therefore realized as an ADDITIONAL modifier class layered on top of
// Avatar's own rendered span (via the `className` passthrough every
// component in this package supports), not by adding a third physical size
// to Avatar. `.hx-avatar-group__avatar--l/m/s` in index.css declares its own
// width/height/font-size and — same specificity, later in the cascade —
// wins over Avatar's own `.hx-avatar--sm/md`. The `size="md"` passed to
// Avatar below is therefore inert scaffolding only (Avatar requires a size,
// and every actual dimension is supplied by the group modifier class).
export const AvatarGroup = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, AvatarGroupProps>(
    ({ avatars, size = "l", maxVisible = 3, ariaLabel, className, ...rest }, ref) => {
      const visible = avatars.slice(0, maxVisible);
      const overflow = avatars.length - visible.length;
      const cls = ["hx-avatar-group", className].filter(Boolean).join(" ");

      return (
        <div
          {...rest}
          ref={ref}
          className={cls}
          {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
        >
          {visible.map(({ id, ...avatarProps }, index) => (
            <Avatar
              key={id ?? index}
              {...avatarProps}
              size="md"
              className={`hx-avatar-group__avatar hx-avatar-group__avatar--${size}`}
            />
          ))}
          {overflow > 0 && (
            <span
              className={`hx-avatar hx-avatar-group__avatar hx-avatar-group__avatar--${size} hx-avatar-group__overflow`}
            >
              {`+${overflow}`}
            </span>
          )}
        </div>
      );
    }
  ),
  { displayName: "AvatarGroup" }
);

import * as React from "react";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  name: string;
  size?: "sm" | "md";
}

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Avatar = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLSpanElement, AvatarProps>(
    ({ src, name, size = "md", className, ...rest }, ref) => {
      const cls = ["hx-avatar", `hx-avatar--${size}`, className].filter(Boolean).join(" ");
      return (
        <span {...rest} ref={ref} className={cls}>
          {src ? (
            <img className="hx-avatar__img" src={src} alt={name} />
          ) : (
            initialsFrom(name)
          )}
        </span>
      );
    }
  ),
  { displayName: "Avatar" }
);

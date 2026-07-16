import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...rest }, ref) => {
    const cls = ["hx-btn", `hx-btn--${variant}`, size === "sm" && "hx-btn--sm", className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={cls} {...rest} />;
  }
);
Button.displayName = "Button";

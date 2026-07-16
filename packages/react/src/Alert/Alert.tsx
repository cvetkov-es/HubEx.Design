import * as React from "react";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  severity?: "info" | "success" | "warning" | "danger";
  title?: string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Alert = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, AlertProps>(
    ({ severity = "info", title, className, children, ...rest }, ref) => {
      const cls = ["hx-alert", `hx-alert--${severity}`, className].filter(Boolean).join(" ");
      // role="alert" is an assertive live region — appropriate for
      // warning/danger, which demand immediate attention. info/success are
      // announced politely via role="status" instead.
      const role = severity === "warning" || severity === "danger" ? "alert" : "status";
      return (
        <div {...rest} ref={ref} className={cls} role={role}>
          <div className="hx-alert__body">
            {title && <div className="hx-alert__title">{title}</div>}
            {children}
          </div>
        </div>
      );
    }
  ),
  { displayName: "Alert" }
);

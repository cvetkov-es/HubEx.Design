import * as React from "react";

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, className, children }) => {
  const cls = ["hx-field", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      {label && (
        <label className="hx-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

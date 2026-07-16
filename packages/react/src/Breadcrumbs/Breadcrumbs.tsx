import * as React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Plain named function component (no forwardRef) — see Table.tsx for why
// naming the function is sufficient to get a correct displayName without a
// separate `Breadcrumbs.displayName = "Breadcrumbs"` side-effect statement.
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const cls = ["hx-breadcrumbs", className].filter(Boolean).join(" ");
  return (
    <nav className={cls} aria-label="Breadcrumb">
      <ol className="hx-breadcrumbs__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="hx-breadcrumbs__item">
            {item.href ? (
              <a className="hx-breadcrumbs__link" href={item.href}>
                {item.label}
              </a>
            ) : (
              <span className="hx-breadcrumbs__current" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="hx-breadcrumbs__sep" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

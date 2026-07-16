import * as React from "react";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Pagination = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLElement, PaginationProps>(
    ({ page, pageCount, onPageChange, className, ...rest }, ref) => {
      const cls = ["hx-pagination", className].filter(Boolean).join(" ");
      const pages = Array.from({ length: Math.max(pageCount, 0) }, (_, i) => i + 1);
      const isFirst = page <= 1;
      const isLast = page >= pageCount;

      return (
        <nav ref={ref} className={cls} aria-label="Pagination" {...rest}>
          <button
            type="button"
            className="hx-pagination__btn hx-pagination__btn--prev"
            aria-label="Previous page"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
          >
            ‹
          </button>
          <ul className="hx-pagination__pages">
            {pages.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  className={["hx-pagination__page", p === page && "hx-pagination__page--active"]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="hx-pagination__btn hx-pagination__btn--next"
            aria-label="Next page"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
          >
            ›
          </button>
        </nav>
      );
    }
  ),
  { displayName: "Pagination" }
);

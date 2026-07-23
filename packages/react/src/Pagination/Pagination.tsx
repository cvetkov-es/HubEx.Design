import * as React from "react";

// BREAKING (0.3.x): replaces the old `{page, pageCount, onPageChange}` API
// (prev/next arrow buttons, no page-size control) with the official DS's
// item-count-driven API, read from
// tools/.official-ds-ref/package/dist/esm/src/components/Pagination/*.d.ts.
// The official surface has no prev/next arrows at all (only PaginationPageButton,
// Ellipsis, and PageSizeSelector appear in Pagination.styles.d.ts) — this
// rewrite drops them to match.
export interface PaginationChangePayload {
  page: number;
  pageSize: number;
  /** (page - 1) * pageSize */
  offset: number;
}

export interface BuildPaginationItemsOptions {
  /** Pages shown in the start/end edge block before an ellipsis. @default 5 */
  edgeCount?: number;
  /** Pages shown on each side of the current page in the middle block. @default 2 */
  siblingCount?: number;
  /**
   * At or below this many total pages, all pages render with no ellipsis.
   * @default 7 (confirmed from the vendored bundle, `function Gt`:
   * `E.compactThreshold ?? 7`).
   */
  compactThreshold?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
// Confirmed from the vendored bundle (`var Pt=[25,50,100]`) — no "10" tier.
const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE_LABEL = "Content";
const DEFAULT_PAGINATION_ARIA_LABEL = "Pagination";
const defaultGetPageAriaLabel = (page: number) => `Page ${page}`;

function getTotalPages(totalItems: number, pageSize: number): number {
  return totalItems <= 0 || pageSize <= 0 ? 0 : Math.ceil(totalItems / pageSize);
}
function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
function clampPage(page: number, totalPages: number): number {
  return totalPages <= 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
}
function recalcPageOnPageSizeChange(oldPage: number, oldSize: number, newSize: number): number {
  return Math.floor(((oldPage - 1) * oldSize) / newSize) + 1;
}
function buildPaginationChangePayload(page: number, pageSize: number): PaginationChangePayload {
  return { page, pageSize, offset: getOffset(page, pageSize) };
}

type PaginationPageItem = { type: "page"; page: number };
type PaginationEllipsisItem = { type: "ellipsis"; key: "start" | "end" };
type PaginationItemDescriptor = PaginationPageItem | PaginationEllipsisItem;

// Matches the shapes described in Figma per the vendored doc comment: start
// (1…5…last), middle (1…window…last), end (1…last five), compact (all pages).
function buildPaginationItems(
  totalPages: number,
  currentPage: number,
  options: BuildPaginationItemsOptions = {}
): PaginationItemDescriptor[] {
  const edgeCount = options.edgeCount ?? 5;
  const siblingCount = options.siblingCount ?? 2;
  const compactThreshold = options.compactThreshold ?? 7;

  if (totalPages <= 0) return [];
  if (totalPages <= compactThreshold) {
    return Array.from({ length: totalPages }, (_, i) => ({ type: "page", page: i + 1 }) as const);
  }

  const items: PaginationItemDescriptor[] = [];
  if (currentPage <= edgeCount) {
    for (let p = 1; p <= edgeCount; p++) items.push({ type: "page", page: p });
    items.push({ type: "ellipsis", key: "end" });
    items.push({ type: "page", page: totalPages });
  } else if (currentPage >= totalPages - edgeCount + 1) {
    items.push({ type: "page", page: 1 });
    items.push({ type: "ellipsis", key: "start" });
    for (let p = totalPages - edgeCount + 1; p <= totalPages; p++) items.push({ type: "page", page: p });
  } else {
    items.push({ type: "page", page: 1 });
    items.push({ type: "ellipsis", key: "start" });
    for (let p = currentPage - siblingCount; p <= currentPage + siblingCount; p++) {
      items.push({ type: "page", page: p });
    }
    items.push({ type: "ellipsis", key: "end" });
    items.push({ type: "page", page: totalPages });
  }
  return items;
}

function getPaginationItemKey(item: PaginationItemDescriptor): string {
  return item.type === "page" ? `page-${item.page}` : `ellipsis-${item.key}`;
}

function normalizePageSizeOptions(
  options: number[],
  currentPageSize?: number
): { value: string; label: string }[] {
  const base = options.length > 0 ? options : DEFAULT_PAGE_SIZE_OPTIONS;
  const set = new Set(base);
  if (currentPageSize !== undefined) set.add(currentPageSize);
  return Array.from(set)
    .sort((a, b) => a - b)
    .map((n) => ({ value: String(n), label: String(n) }));
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of items in the list. */
  totalItems: number;
  /** Current page in controlled mode (1-indexed). Out-of-range values are clamped for display; `onChange` reports the clamped page. */
  page?: number;
  /** Initial page in uncontrolled mode. @default 1 */
  defaultPage?: number;
  /** Page size in controlled mode. */
  pageSize?: number;
  /** Initial page size in uncontrolled mode. @default 25 */
  defaultPageSize?: number;
  /** Fires on page or page-size change (incl. programmatic clamping). */
  onChange?: (payload: PaginationChangePayload) => void;
  /** Label before the page-size select. @default 'Content' */
  pageSizeLabel?: string;
  pageSizeOptions?: number[];
  /** Hides the page-size selector entirely. */
  hidePageSizeSelector?: boolean;
  buildItemsOptions?: BuildPaginationItemsOptions;
  /** Disables all page buttons and the page-size select. */
  disabled?: boolean;
  /** Accessible name of the pagination nav. @default 'Pagination' */
  ariaLabel?: string;
  /** Accessible name of the page-size select. @default pageSizeLabel */
  pageSizeAriaLabel?: string;
  /** aria-label for a page button. @default `Page ${page}` */
  getPageAriaLabel?: (page: number) => string;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Pagination = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLElement, PaginationProps>((props, ref) => {
    const {
      totalItems,
      page,
      defaultPage = DEFAULT_PAGE,
      pageSize,
      defaultPageSize = DEFAULT_PAGE_SIZE,
      onChange,
      pageSizeLabel = DEFAULT_PAGE_SIZE_LABEL,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      hidePageSizeSelector,
      buildItemsOptions,
      disabled,
      className,
      ariaLabel = DEFAULT_PAGINATION_ARIA_LABEL,
      pageSizeAriaLabel,
      getPageAriaLabel = defaultGetPageAriaLabel,
      ...rest
    } = props;

    const isPageControlled = page !== undefined;
    const isPageSizeControlled = pageSize !== undefined;
    const [internalPage, setInternalPage] = React.useState(defaultPage);
    const [internalPageSize, setInternalPageSize] = React.useState(defaultPageSize);
    const sizeSelectId = React.useId();

    const resolvedPageSize = isPageSizeControlled ? (pageSize as number) : internalPageSize;
    const totalPages = getTotalPages(totalItems, resolvedPageSize);
    const rawPage = isPageControlled ? (page as number) : internalPage;
    const resolvedPage = clampPage(rawPage, totalPages);

    const selectPage = (nextPage: number) => {
      const clamped = clampPage(nextPage, totalPages);
      if (!isPageControlled) setInternalPage(clamped);
      onChange?.(buildPaginationChangePayload(clamped, resolvedPageSize));
    };

    const selectPageSize = (nextSize: number) => {
      const recalculated = recalcPageOnPageSizeChange(resolvedPage, resolvedPageSize, nextSize);
      const clampedPage = clampPage(recalculated, getTotalPages(totalItems, nextSize));
      if (!isPageSizeControlled) setInternalPageSize(nextSize);
      if (!isPageControlled) setInternalPage(clampedPage);
      onChange?.(buildPaginationChangePayload(clampedPage, nextSize));
    };

    const items = buildPaginationItems(totalPages, resolvedPage, buildItemsOptions);
    const cls = ["hx-pagination", className].filter(Boolean).join(" ");

    return (
      <nav {...rest} ref={ref} className={cls} aria-label={ariaLabel}>
        <ul className="hx-pagination__pages">
          {items.map((item) =>
            item.type === "page" ? (
              <li key={getPaginationItemKey(item)}>
                <button
                  type="button"
                  className={[
                    "hx-pagination__page",
                    item.page === resolvedPage && "hx-pagination__page--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={item.page === resolvedPage ? "page" : undefined}
                  aria-label={getPageAriaLabel(item.page)}
                  disabled={disabled}
                  onClick={() => selectPage(item.page)}
                >
                  {item.page}
                </button>
              </li>
            ) : (
              <li key={getPaginationItemKey(item)}>
                <span className="hx-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              </li>
            )
          )}
        </ul>
        {!hidePageSizeSelector && (
          <div className="hx-pagination__size">
            <label className="hx-pagination__size-label" htmlFor={sizeSelectId}>
              {pageSizeLabel}
            </label>
            <select
              id={sizeSelectId}
              className="hx-pagination__size-select"
              aria-label={pageSizeAriaLabel ?? pageSizeLabel}
              value={String(resolvedPageSize)}
              disabled={disabled}
              onChange={(event) => selectPageSize(Number(event.target.value))}
            >
              {normalizePageSizeOptions(pageSizeOptions, resolvedPageSize).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>
    );
  }),
  { displayName: "Pagination" }
);

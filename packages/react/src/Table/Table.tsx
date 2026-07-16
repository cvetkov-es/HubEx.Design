import * as React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
export interface TableHeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

// Table is composed of a root <table> plus four subcomponents attached as
// static properties (Table.Head/Row/Cell/HeadCell). Each subcomponent is a
// plain *named* function component (not forwardRef) — naming the function
// gives it a correct `.name`/devtools identity without a separate
// `X.displayName = "X"` statement, which (per Button.tsx) is a side-effect
// statement that defeats tree-shaking. The whole set is wired onto the root
// via one /* @__PURE__ */ Object.assign call, so when a consumer never
// imports `Table`, esbuild can drop the root AND every subcomponent
// together as a single unreferenced, side-effect-free unit.
function TableImpl({ className, ...rest }: TableProps) {
  const cls = ["hx-table", className].filter(Boolean).join(" ");
  return <table className={cls} {...rest} />;
}

function TableHead({ className, ...rest }: TableHeadProps) {
  const cls = ["hx-table__head", className].filter(Boolean).join(" ");
  return <thead className={cls} {...rest} />;
}

function TableRow({ className, ...rest }: TableRowProps) {
  const cls = ["hx-table__row", className].filter(Boolean).join(" ");
  return <tr className={cls} {...rest} />;
}

function TableCell({ className, ...rest }: TableCellProps) {
  const cls = ["hx-table__cell", className].filter(Boolean).join(" ");
  return <td className={cls} {...rest} />;
}

function TableHeadCell({ className, ...rest }: TableHeadCellProps) {
  const cls = ["hx-table__headcell", className].filter(Boolean).join(" ");
  return <th className={cls} {...rest} />;
}

export const Table = /* @__PURE__ */ Object.assign(TableImpl, {
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  HeadCell: TableHeadCell,
  displayName: "Table"
});

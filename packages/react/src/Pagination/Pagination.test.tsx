import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Pagination } from "./Pagination";

test("renders a nav with the base class and default aria-label", () => {
  render(<Pagination totalItems={100} />);
  expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass("hx-pagination");
});

test("uses a custom ariaLabel when given", () => {
  render(<Pagination totalItems={100} ariaLabel="Results pages" />);
  expect(screen.getByRole("navigation", { name: "Results pages" })).toBeInTheDocument();
});

test("renders one page button per page when under the compact threshold", () => {
  // 100 items / default pageSize 25 = 4 pages, well under the ellipsis threshold
  render(<Pagination totalItems={100} />);
  expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
});

test("marks the current (default first) page as active", () => {
  render(<Pagination totalItems={100} />);
  expect(screen.getByRole("button", { name: "Page 1" })).toHaveClass("hx-pagination__page--active");
  expect(screen.getByRole("button", { name: "Page 2" })).not.toHaveClass("hx-pagination__page--active");
});

test("respects a controlled page prop for the active page class", () => {
  render(<Pagination totalItems={100} page={3} onChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Page 3" })).toHaveClass("hx-pagination__page--active");
});

test("clicking a page button calls onChange with {page, pageSize, offset}", () => {
  const onChange = vi.fn();
  render(<Pagination totalItems={100} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  expect(onChange).toHaveBeenCalledWith({ page: 3, pageSize: 25, offset: 50 });
});

test("in uncontrolled mode, clicking a page button moves the active class", () => {
  render(<Pagination totalItems={100} />);
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  expect(screen.getByRole("button", { name: "Page 3" })).toHaveClass("hx-pagination__page--active");
  expect(screen.getByRole("button", { name: "Page 1" })).not.toHaveClass("hx-pagination__page--active");
});

test("in controlled mode, clicking a page button does not move the active class on its own", () => {
  render(<Pagination totalItems={100} page={1} onChange={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  expect(screen.getByRole("button", { name: "Page 1" })).toHaveClass("hx-pagination__page--active");
});

test("defaultPage sets the initial uncontrolled active page", () => {
  render(<Pagination totalItems={100} defaultPage={2} />);
  expect(screen.getByRole("button", { name: "Page 2" })).toHaveClass("hx-pagination__page--active");
});

test("renders a page-size selector by default with the pageSizeLabel", () => {
  render(<Pagination totalItems={100} pageSizeLabel="Rows" />);
  expect(screen.getByLabelText("Rows")).toBeInTheDocument();
});

test("hidePageSizeSelector hides the page-size selector", () => {
  render(<Pagination totalItems={100} hidePageSizeSelector />);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("changing the page size calls onChange with the recalculated page/offset", () => {
  const onChange = vi.fn();
  render(<Pagination totalItems={100} onChange={onChange} pageSizeOptions={[10, 25, 50]} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "50" } });
  expect(onChange).toHaveBeenCalledWith({ page: 1, pageSize: 50, offset: 0 });
});

test("disabled disables page buttons and the page-size select", () => {
  render(<Pagination totalItems={100} disabled />);
  expect(screen.getByRole("button", { name: "Page 1" })).toBeDisabled();
  expect(screen.getByRole("combobox")).toBeDisabled();
});

test("uses ellipsis items once totalPages exceeds the compact threshold", () => {
  render(<Pagination totalItems={1000} pageSize={10} />); // 100 pages
  expect(screen.queryAllByText("…").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "Page 100" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Page 50" })).not.toBeInTheDocument();
});

test("default compactThreshold is 7: exactly 7 total pages render with no ellipsis", () => {
  // 700 items / 100 per page = 7 pages, at the compact threshold boundary.
  render(<Pagination totalItems={700} defaultPageSize={100} />);
  expect(screen.queryByText("…")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Page 7" })).toBeInTheDocument();
});

test("default compactThreshold is 7: 8 total pages render with an ellipsis", () => {
  // 800 items / 100 per page = 8 pages, just over the compact threshold.
  render(<Pagination totalItems={800} defaultPageSize={100} />);
  expect(screen.queryAllByText("…").length).toBeGreaterThan(0);
});

test("default pageSizeOptions are 25/50/100, with no 10 tier", () => {
  render(<Pagination totalItems={1000} />);
  const values = screen
    .getAllByRole("option")
    .map((option) => (option as HTMLOptionElement).value);
  expect(values).toEqual(["25", "50", "100"]);
});

test("getPageAriaLabel overrides the per-page aria-label", () => {
  render(<Pagination totalItems={100} getPageAriaLabel={(p) => `Go to page ${p}`} />);
  expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
});

test("forwards ref to the underlying nav element", () => {
  const ref = React.createRef<HTMLElement>();
  render(<Pagination totalItems={100} ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("navigation"));
});

test("preserves custom className alongside the base class", () => {
  render(<Pagination totalItems={100} className="custom" />);
  expect(screen.getByRole("navigation")).toHaveClass("hx-pagination", "custom");
});

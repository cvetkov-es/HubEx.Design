import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Pagination } from "./Pagination";

test("renders a nav with the base class", () => {
  render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);
  expect(screen.getByRole("navigation")).toHaveClass("hx-pagination");
});

test("disables the previous button on the first page", () => {
  render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
});

test("disables the next button on the last page", () => {
  render(<Pagination page={5} pageCount={5} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
});

test("calls onPageChange with the next page number when next is clicked", () => {
  const onPageChange = vi.fn();
  render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("calls onPageChange with the previous page number when previous is clicked", () => {
  const onPageChange = vi.fn();
  render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />);
  fireEvent.click(screen.getByRole("button", { name: /previous/i }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("calls onPageChange when a page number button is clicked", () => {
  const onPageChange = vi.fn();
  render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  expect(onPageChange).toHaveBeenCalledWith(3);
});

test("marks the current page button as active", () => {
  render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: "2" })).toHaveClass("hx-pagination__page--active");
  expect(screen.getByRole("button", { name: "1" })).not.toHaveClass("hx-pagination__page--active");
});

test("forwards ref to the underlying nav element", () => {
  const ref = React.createRef<HTMLElement>();
  render(<Pagination page={1} pageCount={5} onPageChange={() => {}} ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("navigation"));
});

test("preserves custom className alongside base class", () => {
  render(<Pagination page={1} pageCount={5} onPageChange={() => {}} className="custom" />);
  expect(screen.getByRole("navigation")).toHaveClass("hx-pagination", "custom");
});

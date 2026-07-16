import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Chip } from "./Chip";

test("renders children with the base class", () => {
  render(<Chip>Filter: Open</Chip>);
  expect(screen.getByText("Filter: Open")).toBeInTheDocument();
  expect(document.querySelector(".hx-chip")).toBeInTheDocument();
});

test("does not render a remove button when onRemove is not given", () => {
  render(<Chip>Filter: Open</Chip>);
  expect(document.querySelector(".hx-chip__remove")).not.toBeInTheDocument();
});

test("renders a remove button when onRemove is given, and clicking it calls onRemove", () => {
  const onRemove = vi.fn();
  render(<Chip onRemove={onRemove}>Filter: Open</Chip>);
  const removeBtn = document.querySelector(".hx-chip__remove");
  expect(removeBtn).toBeInTheDocument();
  fireEvent.click(removeBtn as Element);
  expect(onRemove).toHaveBeenCalledTimes(1);
});

test("preserves custom className alongside the base class", () => {
  render(<Chip className="custom">Filter: Open</Chip>);
  expect(document.querySelector(".hx-chip")).toHaveClass("hx-chip", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Chip data-testid="chip-el">Filter: Open</Chip>);
  expect(screen.getByTestId("chip-el")).toBeInTheDocument();
});

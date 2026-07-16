import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Tabs } from "./Tabs";

const items = [
  { value: "details", label: "Details" },
  { value: "history", label: "History" },
  { value: "files", label: "Files" }
];

test("renders one item per entry with the base class", () => {
  render(<Tabs value="details" onChange={vi.fn()} items={items} />);
  expect(screen.getByText("Details")).toBeInTheDocument();
  expect(screen.getByText("History")).toBeInTheDocument();
  expect(screen.getByText("Files")).toBeInTheDocument();
  expect(document.querySelector(".hx-tabs")).toBeInTheDocument();
});

test("marks the item matching value as active", () => {
  render(<Tabs value="history" onChange={vi.fn()} items={items} />);
  expect(screen.getByText("History")).toHaveClass("hx-tabs__item--active");
  expect(screen.getByText("Details")).not.toHaveClass("hx-tabs__item--active");
  expect(screen.getByText("Files")).not.toHaveClass("hx-tabs__item--active");
});

test("calls onChange with the clicked item's value", () => {
  const onChange = vi.fn();
  render(<Tabs value="details" onChange={onChange} items={items} />);
  fireEvent.click(screen.getByText("Files"));
  expect(onChange).toHaveBeenCalledWith("files");
});

test("clicking the already-active item still calls onChange with its value", () => {
  const onChange = vi.fn();
  render(<Tabs value="details" onChange={onChange} items={items} />);
  fireEvent.click(screen.getByText("Details"));
  expect(onChange).toHaveBeenCalledWith("details");
});

test("preserves custom className alongside the base class", () => {
  render(<Tabs value="details" onChange={vi.fn()} items={items} className="custom" />);
  expect(document.querySelector(".hx-tabs")).toHaveClass("hx-tabs", "custom");
});

test("passes native attributes like data-testid and id through to the root", () => {
  render(<Tabs value="details" onChange={vi.fn()} items={items} data-testid="record-tabs" id="record-tabs-el" />);
  const root = document.querySelector(".hx-tabs")!;
  expect(root).toHaveAttribute("data-testid", "record-tabs");
  expect(root).toHaveAttribute("id", "record-tabs-el");
});

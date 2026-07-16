import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Tag } from "./Tag";

test("renders children with the base class and default neutral color", () => {
  render(<Tag>Active</Tag>);
  const tag = screen.getByText("Active");
  expect(tag).toHaveClass("hx-tag", "hx-tag--neutral");
});

test("applies the color modifier class", () => {
  render(<Tag color="danger">Overdue</Tag>);
  expect(screen.getByText("Overdue")).toHaveClass("hx-tag--danger");
});

test("applies the brand color modifier class", () => {
  render(<Tag color="brand">New</Tag>);
  expect(screen.getByText("New")).toHaveClass("hx-tag--brand");
});

test("preserves custom className alongside the base class", () => {
  render(<Tag className="custom">Active</Tag>);
  expect(screen.getByText("Active")).toHaveClass("hx-tag", "custom");
});

test("passes native attributes like data-testid and id through", () => {
  render(
    <Tag data-testid="tag-el" id="tag-1">
      Active
    </Tag>
  );
  const tag = screen.getByTestId("tag-el");
  expect(tag).toHaveAttribute("id", "tag-1");
});

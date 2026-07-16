import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Icon } from "./Icon";

test("renders the glyph name as text with the material and hx-icon classes", () => {
  render(<Icon name="check_circle" />);
  const icon = screen.getByText("check_circle");
  expect(icon).toHaveClass("material", "hx-icon");
});

test("renders no svg element", () => {
  render(<Icon name="check_circle" />);
  expect(document.querySelector("svg")).not.toBeInTheDocument();
});

test("applies an inline fontSize when size is given", () => {
  render(<Icon name="check_circle" size={24} />);
  const icon = screen.getByText("check_circle");
  expect(icon).toHaveStyle({ fontSize: "24px" });
});

test("does not set an inline fontSize when size is not given", () => {
  render(<Icon name="check_circle" />);
  const icon = screen.getByText("check_circle");
  expect(icon.style.fontSize).toBe("");
});

test("preserves custom className alongside the base classes", () => {
  render(<Icon name="check_circle" className="custom" />);
  expect(screen.getByText("check_circle")).toHaveClass("material", "hx-icon", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Icon name="check_circle" data-testid="icon-el" />);
  expect(screen.getByTestId("icon-el")).toBeInTheDocument();
});

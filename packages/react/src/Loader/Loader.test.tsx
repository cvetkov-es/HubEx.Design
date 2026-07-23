import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Loader } from "./Loader";

test("renders with role=status", () => {
  render(<Loader size="medium" color="color-icon-primary" />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("has an accessible name for a11y", () => {
  render(<Loader size="medium" color="color-icon-primary" />);
  expect(screen.getByRole("status")).toHaveAccessibleName();
});

test.each(["small", "medium", "large"] as const)(
  "size=%s applies the hx-loader--%s class",
  (size) => {
    render(<Loader size={size} color="color-icon-primary" />);
    expect(screen.getByRole("status")).toHaveClass("hx-loader", `hx-loader--${size}`);
  }
);

test.each(["color-icon-primary", "color-icon-secondary", "color-icon-error"] as const)(
  "color=%s applies the hx-loader--%s class",
  (color) => {
    render(<Loader size="medium" color={color} />);
    expect(screen.getByRole("status")).toHaveClass(`hx-loader--${color}`);
  }
);

test("renders no inline SVG", () => {
  render(<Loader size="large" color="color-icon-error" />);
  expect(document.querySelector("svg")).not.toBeInTheDocument();
});

test("preserves a custom className alongside the generated classes", () => {
  render(<Loader size="medium" color="color-icon-primary" className="custom" />);
  expect(screen.getByRole("status")).toHaveClass("hx-loader", "custom");
});

test("forwards ref to the underlying element", () => {
  const ref = React.createRef<HTMLDivElement>();
  render(<Loader size="medium" color="color-icon-primary" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("status"));
});

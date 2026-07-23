import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Badge } from "./Badge";

test("defaults to the neutral variant", () => {
  render(<Badge>New</Badge>);
  expect(document.querySelector(".hx-badge")).toHaveClass("hx-badge", "hx-badge--neutral");
});

test.each(["neutral", "accent", "success", "warning", "error"] as const)(
  "variant=%s renders the matching modifier class",
  (variant) => {
    render(<Badge variant={variant}>Label</Badge>);
    expect(document.querySelector(".hx-badge")).toHaveClass(`hx-badge--${variant}`);
  }
);

test("renders children as content", () => {
  render(<Badge variant="accent">5 new</Badge>);
  expect(screen.getByText("5 new")).toBeInTheDocument();
});

test("sets aria-label when provided", () => {
  render(<Badge ariaLabel="Five new items">5</Badge>);
  expect(screen.getByLabelText("Five new items")).toBeInTheDocument();
});

test("preserves custom className alongside the base class", () => {
  render(<Badge className="custom">New</Badge>);
  expect(document.querySelector(".hx-badge")).toHaveClass("hx-badge", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Badge data-testid="badge-el">New</Badge>);
  expect(screen.getByTestId("badge-el")).toBeInTheDocument();
});

test("forwards ref to the underlying span element", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(
    <Badge ref={ref} data-testid="badge-el">
      New
    </Badge>
  );
  expect(ref.current).toBe(screen.getByTestId("badge-el"));
});

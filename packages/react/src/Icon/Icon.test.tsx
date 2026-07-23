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

test("defaults to the --hx-size-icon-x5 (20px) size class when no size given", () => {
  render(<Icon name="check_circle" />);
  expect(screen.getByText("check_circle")).toHaveClass("hx-icon--x5");
});

test("maps an exact token pixel size to its --hx-size-icon-* class", () => {
  render(<Icon name="check_circle" size={24} />);
  expect(screen.getByText("check_circle")).toHaveClass("hx-icon--x6");
});

test("snaps a non-token pixel size to the nearest --hx-size-icon-* class", () => {
  render(<Icon name="check_circle" size={25} />);
  expect(screen.getByText("check_circle")).toHaveClass("hx-icon--x6"); // 24px, nearer than 28px
});

test("never sets an inline fontSize (token classes only, no literal styling)", () => {
  render(<Icon name="check_circle" size={24} />);
  expect(screen.getByText("check_circle").style.fontSize).toBe("");
});

test("applies a --hx-color-icon-* modifier class when color is given", () => {
  render(<Icon name="check_circle" color="accent" />);
  expect(screen.getByText("check_circle")).toHaveClass("hx-icon--color-accent");
});

test("applies no color modifier class when color is not given", () => {
  render(<Icon name="check_circle" />);
  const cls = Array.from(screen.getByText("check_circle").classList);
  expect(cls.some((c) => c.startsWith("hx-icon--color-"))).toBe(false);
});

test("is aria-hidden (decorative) by default", () => {
  render(<Icon name="check_circle" />);
  expect(screen.getByText("check_circle")).toHaveAttribute("aria-hidden", "true");
});

test("sets aria-label and drops aria-hidden when ariaLabel is given", () => {
  render(<Icon name="check_circle" ariaLabel="Success" />);
  const icon = screen.getByLabelText("Success");
  expect(icon).not.toHaveAttribute("aria-hidden");
});

test("preserves custom className alongside the base classes", () => {
  render(<Icon name="check_circle" className="custom" />);
  expect(screen.getByText("check_circle")).toHaveClass("material", "hx-icon", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Icon name="check_circle" data-testid="icon-el" />);
  expect(screen.getByTestId("icon-el")).toBeInTheDocument();
});

test("forwards ref to the underlying span element", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(<Icon name="check_circle" ref={ref} data-testid="icon-el" />);
  expect(ref.current).toBe(screen.getByTestId("icon-el"));
});

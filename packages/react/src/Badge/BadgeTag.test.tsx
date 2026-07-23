import { render, screen } from "@testing-library/react";
import * as React from "react";
import { BadgeTag } from "./BadgeTag";

test("defaults to type=new tone=light", () => {
  render(<BadgeTag>New</BadgeTag>);
  expect(document.querySelector(".hx-badge-tag")).toHaveClass(
    "hx-badge-tag",
    "hx-badge-tag--new",
    "hx-badge-tag--light"
  );
});

test.each(["new", "beta"] as const)("type=%s renders the matching modifier class", (type) => {
  render(<BadgeTag type={type}>Label</BadgeTag>);
  expect(document.querySelector(".hx-badge-tag")).toHaveClass(`hx-badge-tag--${type}`);
});

test.each(["light", "dark"] as const)("tone=%s renders the matching modifier class", (tone) => {
  render(<BadgeTag tone={tone}>Label</BadgeTag>);
  expect(document.querySelector(".hx-badge-tag")).toHaveClass(`hx-badge-tag--${tone}`);
});

test("renders children as content", () => {
  render(<BadgeTag type="beta">Beta</BadgeTag>);
  expect(screen.getByText("Beta")).toBeInTheDocument();
});

test("sets aria-label when provided", () => {
  render(<BadgeTag ariaLabel="New feature" />);
  expect(screen.getByLabelText("New feature")).toBeInTheDocument();
});

test("forwards ref to the underlying span element", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(
    <BadgeTag ref={ref} data-testid="tag-el">
      New
    </BadgeTag>
  );
  expect(ref.current).toBe(screen.getByTestId("tag-el"));
});

test("preserves custom className alongside the base class", () => {
  render(<BadgeTag className="custom">New</BadgeTag>);
  expect(document.querySelector(".hx-badge-tag")).toHaveClass("hx-badge-tag", "custom");
});

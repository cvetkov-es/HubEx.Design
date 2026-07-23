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

// Confirmed from the vendored bundle (`gs={new:{...border:"color-border-accent"},
// beta:{...border:"color-border-error"}}`, read via `ns(A,B){return gs[A][B]}`):
// border colour is keyed ONLY by `type` — independent of `tone` — and text colour
// is keyed ONLY by `tone` — independent of `type`. `.hx-badge-tag--{type}` and
// `.hx-badge-tag--{light,dark}` are therefore two orthogonal, non-compound
// modifier classes (packages/css/src/index.css), never combined selectors.
test.each(["light", "dark"] as const)(
  "type=new always carries the accent-border class regardless of tone=%s",
  (tone) => {
    render(
      <BadgeTag type="new" tone={tone}>
        New
      </BadgeTag>
    );
    expect(document.querySelector(".hx-badge-tag")).toHaveClass("hx-badge-tag--new");
  }
);

test.each(["light", "dark"] as const)(
  "type=beta always carries the error-border class regardless of tone=%s",
  (tone) => {
    render(
      <BadgeTag type="beta" tone={tone}>
        Beta
      </BadgeTag>
    );
    expect(document.querySelector(".hx-badge-tag")).toHaveClass("hx-badge-tag--beta");
  }
);

test("renders children as content", () => {
  render(<BadgeTag type="beta">Beta</BadgeTag>);
  expect(screen.getByText("Beta")).toBeInTheDocument();
});

test("falls back to the label 'New' when children is omitted and type is new (default)", () => {
  render(<BadgeTag />);
  expect(screen.getByText("New")).toBeInTheDocument();
});

test("falls back to the label 'Beta' when children is omitted and type=beta", () => {
  render(<BadgeTag type="beta" />);
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

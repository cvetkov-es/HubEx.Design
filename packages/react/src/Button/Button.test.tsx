import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Button } from "./Button";

test("renders primary button by default", () => {
  render(<Button>Save</Button>);
  const btn = screen.getByRole("button", { name: "Save" });
  expect(btn).toHaveClass("hx-btn", "hx-btn--primary");
});

test("applies ghost variant", () => {
  render(<Button variant="ghost">Ghost</Button>);
  const btn = screen.getByRole("button", { name: "Ghost" });
  expect(btn).toHaveClass("hx-btn--ghost");
});

test("applies dashed variant", () => {
  render(<Button variant="dashed">Dashed</Button>);
  const btn = screen.getByRole("button", { name: "Dashed" });
  expect(btn).toHaveClass("hx-btn--dashed");
});

test("applies sm size modifier", () => {
  render(
    <Button size="sm" variant="secondary">
      Del
    </Button>
  );
  const btn = screen.getByRole("button", { name: "Del" });
  expect(btn).toHaveClass("hx-btn--secondary", "hx-btn--sm");
});

// `variant: "danger"` has been removed from ButtonProps's union (the design
// has no red filled button), so `<Button variant="danger" />` is now a
// compile-time TypeScript error — that half of the contract is enforced by
// the type checker, not this suite. What we assert here is the runtime half:
// none of the remaining supported variants ever render the retired
// `hx-btn--danger` class.
test("never renders the removed danger class", () => {
  render(
    <>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="dashed">Dashed</Button>
    </>
  );
  for (const btn of screen.getAllByRole("button")) {
    expect(btn).not.toHaveClass("hx-btn--danger");
  }
});

test("forwards native props", () => {
  render(<Button disabled>X</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
});

test("forwards ref to the underlying button element", () => {
  const ref = React.createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Ref</Button>);
  expect(ref.current).toBe(screen.getByRole("button", { name: "Ref" }));
});

test("preserves custom className alongside base classes", () => {
  render(<Button className="custom">Custom</Button>);
  const btn = screen.getByRole("button", { name: "Custom" });
  expect(btn).toHaveClass("hx-btn", "hx-btn--primary", "custom");
});

// --- Task 4: align to the official @hubex/design-system API -------------

test('size="medium" (the new default) renders only the base .hx-btn geometry, no .hx-btn--sm', () => {
  render(<Button size="medium">Medium</Button>);
  const btn = screen.getByRole("button", { name: "Medium" });
  expect(btn).toHaveClass("hx-btn");
  expect(btn).not.toHaveClass("hx-btn--sm");
});

test('size="small" applies the .hx-btn--sm modifier', () => {
  render(<Button size="small">Small</Button>);
  const btn = screen.getByRole("button", { name: "Small" });
  expect(btn).toHaveClass("hx-btn--sm");
});

test('legacy size="sm" still aliases to the small modifier', () => {
  render(<Button size="sm">LegacySm</Button>);
  expect(screen.getByRole("button", { name: "LegacySm" })).toHaveClass("hx-btn--sm");
});

test('legacy size="md" still aliases to medium (no .hx-btn--sm)', () => {
  render(<Button size="md">LegacyMd</Button>);
  expect(screen.getByRole("button", { name: "LegacyMd" })).not.toHaveClass("hx-btn--sm");
});

test("omitting size defaults to medium", () => {
  render(<Button>Default</Button>);
  expect(screen.getByRole("button", { name: "Default" })).not.toHaveClass("hx-btn--sm");
});

test("round applies the .hx-btn--round modifier", () => {
  render(
    <Button round ariaLabel="round-btn" icon="add">
      {null}
    </Button>
  );
  expect(screen.getByRole("button", { name: "round-btn" })).toHaveClass("hx-btn--round");
});

test("fullWidth applies the .hx-btn--full modifier", () => {
  render(<Button fullWidth>Full</Button>);
  expect(screen.getByRole("button", { name: "Full" })).toHaveClass("hx-btn--full");
});

test("loading applies the .hx-btn--loading modifier and disables the button", () => {
  render(<Button loading>Loading</Button>);
  const btn = screen.getByRole("button");
  expect(btn).toHaveClass("hx-btn--loading");
  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute("aria-busy", "true");
});

test("disabled still disables the button (unrelated to loading)", () => {
  render(<Button disabled>Disabled</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
});

test("loading disables the button even when a conflicting disabled={false} is also passed", () => {
  render(
    <Button loading disabled={false}>
      Both
    </Button>
  );
  expect(screen.getByRole("button")).toBeDisabled();
});

test("icon renders a Material glyph span (string name), never inline SVG", () => {
  render(<Button icon="check">Save</Button>);
  expect(screen.getByText("check")).toHaveClass("material");
  expect(document.querySelector("svg")).not.toBeInTheDocument();
});

test("endIcon renders a Material glyph span as well", () => {
  render(<Button endIcon="arrow_forward">Next</Button>);
  expect(screen.getByText("arrow_forward")).toHaveClass("material");
});

test('iconColor="color-icon-accent" maps to the accent icon modifier class', () => {
  render(
    <Button icon="check" iconColor="color-icon-accent">
      Save
    </Button>
  );
  expect(screen.getByText("check")).toHaveClass("hx-btn__icon--accent");
});

test('iconColor="color-icon-secondary" maps to the secondary icon modifier class', () => {
  render(
    <Button icon="check" iconColor="color-icon-secondary">
      Save
    </Button>
  );
  expect(screen.getByText("check")).toHaveClass("hx-btn__icon--secondary");
});

test("error renders an error message and the .hx-btn--error modifier", () => {
  render(<Button error="Required field">Submit</Button>);
  const btn = screen.getByRole("button", { name: "Submit" });
  expect(btn).toHaveClass("hx-btn--error");
  expect(screen.getByText("Required field")).toBeInTheDocument();
});

test("ariaLabel sets the aria-label attribute", () => {
  render(<Button ariaLabel="Close dialog">X</Button>);
  expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
});

test("a native attribute like type still passes through the ...rest spread", () => {
  render(<Button type="submit">Go</Button>);
  expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("type", "submit");
});

test("a native aria-label passed via rest is not clobbered when ariaLabel prop is absent", () => {
  render(<Button aria-label="Native label">Icon-only</Button>);
  expect(screen.getByRole("button", { name: "Native label" })).toBeInTheDocument();
});

test("the ariaLabel prop (a controlled attribute) wins over a conflicting native aria-label from rest", () => {
  render(
    <Button aria-label="Native" ariaLabel="Controlled">
      X
    </Button>
  );
  expect(screen.getByRole("button", { name: "Controlled" })).toBeInTheDocument();
});

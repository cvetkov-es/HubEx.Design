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

import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("renders primary button by default", () => {
  render(<Button>Save</Button>);
  const btn = screen.getByRole("button", { name: "Save" });
  expect(btn).toHaveClass("hx-btn", "hx-btn--primary");
});

test("applies variant and size modifiers", () => {
  render(<Button variant="danger" size="sm">Del</Button>);
  const btn = screen.getByRole("button", { name: "Del" });
  expect(btn).toHaveClass("hx-btn--danger", "hx-btn--sm");
});

test("forwards native props", () => {
  render(<Button disabled>X</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
});

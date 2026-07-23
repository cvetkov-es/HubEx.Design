import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Toggle } from "./Toggle";

test("renders with base class and switch role", () => {
  render(<Toggle name="notify" aria-label="notify" />);
  const el = screen.getByRole("switch", { name: "notify" });
  expect(el).toHaveClass("hx-toggle");
});

test("carries the name attribute", () => {
  render(<Toggle name="notify" aria-label="notify" />);
  expect(screen.getByRole("switch", { name: "notify" })).toHaveAttribute("name", "notify");
});

test("reflects checked state", () => {
  render(<Toggle name="notify" aria-label="notify" checked readOnly />);
  const el = screen.getByRole("switch", { name: "notify" });
  expect(el).toBeChecked();
  expect(el).toHaveAttribute("aria-checked", "true");
});

test("calls onChange with (checked, event) when clicked — boolean first, real ChangeEvent second", () => {
  const onChange = vi.fn();
  render(<Toggle name="notify" aria-label="notify" checked={false} onChange={onChange} />);
  fireEvent.click(screen.getByRole("switch", { name: "notify" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  const [checkedArg, eventArg] = onChange.mock.calls[0];
  expect(checkedArg).toBe(true);
  expect(typeof checkedArg).toBe("boolean");
  expect(eventArg).toBeDefined();
  expect(eventArg).toMatchObject({ target: expect.anything() });
});

test("renders an optional label", () => {
  render(<Toggle name="notify" label="Notify me" />);
  expect(screen.getByRole("switch", { name: "Notify me" })).toBeInTheDocument();
});

test("disabled blocks interaction: no onChange fires and the control is marked disabled", () => {
  const onChange = vi.fn();
  render(<Toggle name="notify" aria-label="notify" disabled onChange={onChange} />);
  const el = screen.getByRole("switch", { name: "notify" });
  expect(el).toBeDisabled();
  fireEvent.click(el);
  expect(onChange).not.toHaveBeenCalled();
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Toggle name="notify" aria-label="notify" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("switch", { name: "notify" }));
});

test("preserves custom className alongside base class", () => {
  render(<Toggle name="notify" aria-label="notify" className="custom" />);
  expect(screen.getByRole("switch", { name: "notify" })).toHaveClass("hx-toggle", "custom");
});

test("drops stray type/role/aria-checked passed via legacy rest props", () => {
  render(
    <Toggle
      name="notify"
      aria-label="notify"
      checked
      readOnly
      // Legacy/foreign attrs from a caller migrating off the pre-0.3 API must
      // not be able to override the controlled type/role/aria-checked below.
      // `type` is typed out of ToggleProps, so it's cast through `any` here
      // purely to exercise the runtime drop.
      {...({ type: "text", role: "button", "aria-checked": "false" } as Record<string, string>)}
    />
  );
  const el = screen.getByRole("switch", { name: "notify" });
  expect(el).toHaveAttribute("type", "checkbox");
  expect(el).toHaveAttribute("role", "switch");
  expect(el).toHaveAttribute("aria-checked", "true");
});

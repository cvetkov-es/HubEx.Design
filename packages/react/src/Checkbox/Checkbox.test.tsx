import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Checkbox } from "./Checkbox";

test("renders with base class", () => {
  render(<Checkbox aria-label="agree" />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toHaveClass("hx-checkbox");
});

test("reflects checked state", () => {
  render(<Checkbox aria-label="agree" checked readOnly />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
});

test("renders associated label text", () => {
  render(<Checkbox label="Agree to terms" />);
  const el = screen.getByRole("checkbox", { name: "Agree to terms" });
  expect(el).toHaveClass("hx-checkbox");
});

test("forwards native props", () => {
  render(<Checkbox aria-label="agree" disabled />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toBeDisabled();
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Checkbox aria-label="agree" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("checkbox", { name: "agree" }));
});

test("preserves custom className alongside base class", () => {
  render(<Checkbox aria-label="agree" className="custom" />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toHaveClass("hx-checkbox", "custom");
});

test("sets the DOM indeterminate property and modifier class when indeterminate", () => {
  render(<Checkbox aria-label="agree" indeterminate />);
  const el = screen.getByRole("checkbox", { name: "agree" }) as HTMLInputElement;
  expect(el.indeterminate).toBe(true);
  expect(el).toHaveClass("hx-checkbox--indeterminate");
});

test("does not set indeterminate by default", () => {
  render(<Checkbox aria-label="agree" />);
  const el = screen.getByRole("checkbox", { name: "agree" }) as HTMLInputElement;
  expect(el.indeterminate).toBe(false);
  expect(el).not.toHaveClass("hx-checkbox--indeterminate");
});

test("clears indeterminate on rerender when the prop flips to false", () => {
  const { rerender } = render(<Checkbox aria-label="agree" indeterminate />);
  const el = screen.getByRole("checkbox", { name: "agree" }) as HTMLInputElement;
  expect(el.indeterminate).toBe(true);
  rerender(<Checkbox aria-label="agree" indeterminate={false} />);
  expect(el.indeterminate).toBe(false);
});

test("calls onChange with a ChangeEvent when toggled", () => {
  const onChange = vi.fn();
  render(<Checkbox aria-label="agree" onChange={onChange} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "agree" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toMatchObject({ target: expect.anything() });
});

test("supports the ariaLabel prop as an alias for aria-label", () => {
  render(<Checkbox ariaLabel="agree via prop" />);
  expect(screen.getByRole("checkbox", { name: "agree via prop" })).toBeInTheDocument();
});

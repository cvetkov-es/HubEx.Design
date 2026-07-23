import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Radio } from "./Radio";

test("renders with base class", () => {
  render(<Radio aria-label="option-a" />);
  expect(screen.getByRole("radio", { name: "option-a" })).toHaveClass("hx-radio");
});

test("reflects checked state", () => {
  render(<Radio aria-label="option-a" checked readOnly />);
  expect(screen.getByRole("radio", { name: "option-a" })).toBeChecked();
});

test("renders associated label text", () => {
  render(<Radio label="Option A" />);
  const el = screen.getByRole("radio", { name: "Option A" });
  expect(el).toHaveClass("hx-radio");
});

test("supports a ReactNode label", () => {
  render(
    <Radio
      label={
        <>
          Option <strong>A</strong>
        </>
      }
    />
  );
  expect(screen.getByRole("radio", { name: "Option A" })).toBeInTheDocument();
});

test("forwards native props (name, value, disabled, required, tabIndex)", () => {
  render(<Radio aria-label="option-a" name="grp" value="a" disabled required tabIndex={-1} />);
  const el = screen.getByRole("radio", { name: "option-a" });
  expect(el).toBeDisabled();
  expect(el).toHaveAttribute("name", "grp");
  expect(el).toHaveAttribute("value", "a");
  expect(el).toBeRequired();
  expect(el).toHaveAttribute("tabindex", "-1");
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Radio aria-label="option-a" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("radio", { name: "option-a" }));
});

test("preserves custom className alongside base class", () => {
  render(<Radio aria-label="option-a" className="custom" />);
  expect(screen.getByRole("radio", { name: "option-a" })).toHaveClass("hx-radio", "custom");
});

test("supports the ariaLabel prop as an alias for aria-label", () => {
  render(<Radio ariaLabel="option via prop" />);
  expect(screen.getByRole("radio", { name: "option via prop" })).toBeInTheDocument();
});

test("fires onChange with a ChangeEvent when clicked", () => {
  const onChange = vi.fn();
  render(<Radio aria-label="option-a" onChange={onChange} />);
  fireEvent.click(screen.getByRole("radio", { name: "option-a" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toMatchObject({ target: expect.anything() });
});

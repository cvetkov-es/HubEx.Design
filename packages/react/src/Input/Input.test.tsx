import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Input } from "./Input";

test("renders with base class", () => {
  render(<Input placeholder="Name" />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-input");
});

test("legacy invalid prop still applies the error modifier and aria-invalid", () => {
  render(<Input placeholder="Name" invalid />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-input", "hx-input--invalid");
  expect(el).toHaveAttribute("aria-invalid", "true");
});

test("errorText renders an error node wired via aria-describedby + aria-invalid", () => {
  render(<Input placeholder="Name" errorText="Required" errorId="name-error" />);
  const input = screen.getByPlaceholderText("Name");
  const error = screen.getByText("Required");
  expect(error).toHaveAttribute("id", "name-error");
  expect(input).toHaveAttribute("aria-describedby", "name-error");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveClass("hx-input--invalid");
});

test("errorText without an explicit errorId still wires aria-describedby to the rendered error node", () => {
  render(<Input placeholder="Name" errorText="Required" />);
  const input = screen.getByPlaceholderText("Name");
  const error = screen.getByText("Required");
  expect(error.id).toBeTruthy();
  expect(input).toHaveAttribute("aria-describedby", error.id);
});

test("allowClear shows a clear button when there is a value, and clicking it clears via onChange", () => {
  // Captured *inside* the handler, synchronously during the native event
  // dispatch: `event.target` is a live DOM node reference, and this
  // controlled render never updates its `value` prop in response (the mock
  // doesn't setState), so React resets the DOM back to "hello" on the
  // re-render that follows -- reading `.target.value` after fireEvent
  // returns would see that reverted value, not the transient "" the
  // component actually fired onChange with.
  let receivedValue: string | undefined;
  const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
    receivedValue = event.target.value;
  });
  render(<Input placeholder="Name" value="hello" allowClear onChange={onChange} />);
  const clearBtn = screen.getByRole("button", { name: /clear/i });
  fireEvent.click(clearBtn);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(receivedValue).toBe("");
});

test("allowClear renders no clear button when there is no value", () => {
  render(<Input placeholder="Name" value="" allowClear onChange={() => {}} />);
  expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
});

test("allowClear is hidden while disabled, even with a value", () => {
  render(<Input placeholder="Name" value="hello" allowClear disabled onChange={() => {}} />);
  expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
});

test("disabled and readOnly reflect on the underlying input", () => {
  render(<Input placeholder="Name" disabled readOnly />);
  const input = screen.getByPlaceholderText("Name") as HTMLInputElement;
  expect(input).toBeDisabled();
  expect(input.readOnly).toBe(true);
});

test("type passthrough", () => {
  render(<Input placeholder="Password" type="password" />);
  expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
});

test("textLimit maps to the native maxLength attribute", () => {
  render(<Input placeholder="Name" textLimit={10} />);
  expect(screen.getByPlaceholderText("Name")).toHaveAttribute("maxLength", "10");
});

test("fullWidth adds the full-width modifier class to the wrapper", () => {
  render(<Input placeholder="Name" fullWidth />);
  const input = screen.getByPlaceholderText("Name");
  expect(input.closest(".hx-input-wrap")).toHaveClass("hx-input--full");
});

test("label renders an associated <label> for the input", () => {
  render(<Input label="Full name" placeholder="Name" />);
  const input = screen.getByPlaceholderText("Name");
  const label = screen.getByText("Full name");
  expect(label.tagName).toBe("LABEL");
  expect(label).toHaveAttribute("for", input.id);
});

test("forwards native props", () => {
  render(<Input placeholder="Name" disabled />);
  expect(screen.getByPlaceholderText("Name")).toBeDisabled();
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Input placeholder="Name" ref={ref} />);
  expect(ref.current).toBe(screen.getByPlaceholderText("Name"));
});

test("preserves custom className alongside base class", () => {
  render(<Input placeholder="Name" className="custom" />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-input", "custom");
});

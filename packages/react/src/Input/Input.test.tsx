import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Input } from "./Input";

test("renders with base class", () => {
  render(<Input placeholder="Name" />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-input");
});

test("applies invalid modifier", () => {
  render(<Input placeholder="Name" invalid />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-input", "hx-input--invalid");
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

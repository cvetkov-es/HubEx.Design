import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Select } from "./Select";

test("renders with base class", () => {
  render(
    <Select aria-label="country">
      <option value="ru">Russia</option>
    </Select>
  );
  expect(screen.getByRole("combobox", { name: "country" })).toHaveClass("hx-select");
});

test("applies invalid modifier", () => {
  render(
    <Select aria-label="country" invalid>
      <option value="ru">Russia</option>
    </Select>
  );
  expect(screen.getByRole("combobox", { name: "country" })).toHaveClass("hx-select", "hx-select--invalid");
});

test("forwards native props", () => {
  render(
    <Select aria-label="country" disabled>
      <option value="ru">Russia</option>
    </Select>
  );
  expect(screen.getByRole("combobox", { name: "country" })).toBeDisabled();
});

test("forwards ref to the underlying select element", () => {
  const ref = React.createRef<HTMLSelectElement>();
  render(
    <Select aria-label="country" ref={ref}>
      <option value="ru">Russia</option>
    </Select>
  );
  expect(ref.current).toBe(screen.getByRole("combobox", { name: "country" }));
});

test("preserves custom className alongside base class", () => {
  render(
    <Select aria-label="country" className="custom">
      <option value="ru">Russia</option>
    </Select>
  );
  expect(screen.getByRole("combobox", { name: "country" })).toHaveClass("hx-select", "custom");
});

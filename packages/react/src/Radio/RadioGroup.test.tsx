import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { RadioGroup } from "./RadioGroup";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C", disabled: true },
];

test("renders one radio per option sharing the group name", () => {
  render(<RadioGroup name="letters" options={options} />);
  const radios = screen.getAllByRole("radio");
  expect(radios).toHaveLength(3);
  for (const el of radios) expect(el).toHaveAttribute("name", "letters");
});

test("single-selects: choosing one option calls onChange(value, event) and unchecks the others", () => {
  const onChange = vi.fn();
  render(<RadioGroup name="letters" value="a" options={options} onChange={onChange} />);
  expect(screen.getByRole("radio", { name: "Option A" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Option B" })).not.toBeChecked();

  fireEvent.click(screen.getByRole("radio", { name: "Option B" }));

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toBe("b");
  expect(onChange.mock.calls[0][1]).toMatchObject({ target: expect.anything() });
});

test("supports uncontrolled usage via defaultValue", () => {
  render(<RadioGroup name="letters" defaultValue="a" options={options} />);
  expect(screen.getByRole("radio", { name: "Option A" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "Option B" }));
  expect(screen.getByRole("radio", { name: "Option B" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Option A" })).not.toBeChecked();
});

test("a disabled option is not selectable", () => {
  const onChange = vi.fn();
  render(<RadioGroup name="letters" value="a" options={options} onChange={onChange} />);
  const disabledOption = screen.getByRole("radio", { name: "Option C" });
  expect(disabledOption).toBeDisabled();
  fireEvent.click(disabledOption);
  expect(onChange).not.toHaveBeenCalled();
  expect(disabledOption).not.toBeChecked();
});

test("direction defaults to column and sets the row modifier class when requested", () => {
  const { container, rerender } = render(<RadioGroup name="letters" options={options} />);
  expect(container.firstElementChild).toHaveClass("hx-radio-group", "hx-radio-group--column");
  rerender(<RadioGroup name="letters" options={options} direction="row" />);
  expect(container.firstElementChild).toHaveClass("hx-radio-group", "hx-radio-group--row");
});

test("exposes a radiogroup role", () => {
  render(<RadioGroup name="letters" options={options} ariaLabel="Letters" />);
  expect(screen.getByRole("radiogroup", { name: "Letters" })).toBeInTheDocument();
});

import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Select, SelectOption } from "./Select";

const options: SelectOption[] = [
  { value: "ru", label: "Russia" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", disabled: true }
];

function openCombobox() {
  const combobox = screen.getByRole("combobox");
  fireEvent.click(combobox);
  return combobox;
}

test("renders the provided options in a listbox once opened", () => {
  render(<Select options={options} />);
  openCombobox();
  expect(screen.getByRole("listbox")).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Russia" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "France" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Germany" })).toBeInTheDocument();
});

test("selecting an option calls onChange with the value and the option, and closes the menu", () => {
  const onChange = vi.fn();
  render(<Select options={options} onChange={onChange} />);
  openCombobox();
  fireEvent.click(screen.getByRole("option", { name: "France" }));
  expect(onChange).toHaveBeenCalledWith("fr", options[1]);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("typing filters the options via the default label filter", () => {
  render(<Select options={options} />);
  const combobox = openCombobox();
  fireEvent.change(combobox, { target: { value: "fra" } });
  expect(screen.getByRole("option", { name: "France" })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "Russia" })).not.toBeInTheDocument();
});

test("a disabled option cannot be selected", () => {
  const onChange = vi.fn();
  render(<Select options={options} onChange={onChange} />);
  openCombobox();
  fireEvent.click(screen.getByRole("option", { name: "Germany" }));
  expect(onChange).not.toHaveBeenCalled();
});

test("allowClear renders a clear control when a value is selected, and clears via onChange", () => {
  const onChange = vi.fn();
  render(<Select options={options} value="ru" allowClear onChange={onChange} />);
  const clearBtn = screen.getByRole("button", { name: /clear/i });
  fireEvent.click(clearBtn);
  expect(onChange).toHaveBeenCalledWith("", null);
});

test("allowClear renders no clear control without a selected value", () => {
  render(<Select options={options} allowClear onChange={() => {}} />);
  expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
});

test("keyboard: ArrowDown moves the active option and Enter selects it", () => {
  const onChange = vi.fn();
  render(<Select options={options} onChange={onChange} />);
  const combobox = openCombobox();
  // opening pre-focuses the first enabled option (Russia, index 0); one
  // ArrowDown moves to the next enabled option (France, index 1).
  fireEvent.keyDown(combobox, { key: "ArrowDown" });
  fireEvent.keyDown(combobox, { key: "Enter" });
  expect(onChange).toHaveBeenCalledWith("fr", options[1]);
});

test("keyboard: Escape closes the menu without selecting", () => {
  const onChange = vi.fn();
  render(<Select options={options} onChange={onChange} />);
  const combobox = openCombobox();
  fireEvent.keyDown(combobox, { key: "Escape" });
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

test("exposes combobox/listbox aria wiring", () => {
  render(<Select options={options} value="ru" />);
  const combobox = screen.getByRole("combobox");
  expect(combobox).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(combobox);
  expect(combobox).toHaveAttribute("aria-expanded", "true");
  const listbox = screen.getByRole("listbox");
  expect(combobox).toHaveAttribute("aria-controls", listbox.id);
  const selected = screen.getByRole("option", { name: "Russia" });
  expect(selected).toHaveAttribute("aria-selected", "true");
});

test("disabled prop disables the trigger", () => {
  render(<Select options={options} disabled />);
  expect(screen.getByRole("combobox")).toBeDisabled();
});

test("legacy invalid prop applies the error modifier", () => {
  render(<Select options={options} invalid />);
  expect(screen.getByRole("combobox")).toHaveClass("hx-select--invalid");
});

test("defaultValue seeds the initial uncontrolled selection", () => {
  render(<Select options={options} defaultValue="fr" />);
  expect(screen.getByRole("combobox")).toHaveValue("France");
});

test("renders a label associated with the trigger", () => {
  render(<Select options={options} label="Country" />);
  const combobox = screen.getByRole("combobox", { name: "Country" });
  expect(combobox).toBeInTheDocument();
});

// Regression test for the chevron being unclickable: the chevron span is
// aria-hidden and has no onClick of its own, so it must never intercept
// pointer events — CSS `pointer-events: none` (packages/css/src/index.css)
// lets clicks fall through to the input beneath it. jsdom doesn't apply CSS
// layout/pointer-events, so a fireEvent.click on the chevron element itself
// can't exercise that fall-through the way a real browser would; instead we
// lock the behavioral contract that matters: the chevron carries no click
// handler (clicking it directly does nothing, i.e. it doesn't stop/steal the
// interaction), and the input/combobox underneath it is what actually opens
// the menu.
test("chevron is non-interactive and clicking the trigger (which the chevron overlays) opens the menu", () => {
  render(<Select options={options} />);
  const combobox = screen.getByRole("combobox");
  const chevron = document.querySelector(".hx-select__chevron");
  expect(chevron).toBeInTheDocument();
  expect(chevron).toHaveAttribute("aria-hidden", "true");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  // Clicking the chevron directly should not itself open anything (it has
  // no handler); the fix relies on pointer-events:none letting the click
  // reach the input instead, which we verify separately below.
  fireEvent.click(chevron as Element);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  fireEvent.click(combobox);
  expect(screen.getByRole("listbox")).toBeInTheDocument();
});

test("consumer onFocus fires and the menu still opens", () => {
  const onFocus = vi.fn();
  render(<Select options={options} onFocus={onFocus} />);
  const combobox = screen.getByRole("combobox");
  fireEvent.focus(combobox);
  expect(onFocus).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("listbox")).toBeInTheDocument();
});

test("consumer onClick fires and the menu still opens", () => {
  const onClick = vi.fn();
  render(<Select options={options} onClick={onClick} />);
  const combobox = screen.getByRole("combobox");
  fireEvent.click(combobox);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("listbox")).toBeInTheDocument();
});

test("consumer onKeyDown fires and keyboard navigation still works", () => {
  const onKeyDown = vi.fn();
  const onChange = vi.fn();
  render(<Select options={options} onChange={onChange} onKeyDown={onKeyDown} />);
  const combobox = openCombobox();
  fireEvent.keyDown(combobox, { key: "ArrowDown" });
  fireEvent.keyDown(combobox, { key: "Enter" });
  expect(onKeyDown).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledWith("fr", options[1]);
});

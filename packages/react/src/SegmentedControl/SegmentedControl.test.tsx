import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

test("renders one radio segment per option with the correct labels", () => {
  render(<SegmentedControl options={options} value="day" />);
  expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  expect(screen.getAllByRole("radio")).toHaveLength(3);
  expect(screen.getByText("Day")).toBeInTheDocument();
  expect(screen.getByText("Week")).toBeInTheDocument();
  expect(screen.getByText("Month")).toBeInTheDocument();
});

test("marks the option matching `value` as active/checked", () => {
  render(<SegmentedControl options={options} value="week" />);
  const weekItem = screen.getByText("Week").closest(".hx-segmented__item");
  expect(weekItem).toHaveClass("hx-segmented__item--active");
  expect(screen.getByText("Week").closest('[role="radio"]')).toHaveAttribute("aria-checked", "true");
});

test("clicking a segment fires onChange with its value", () => {
  const onChange = vi.fn();
  render(<SegmentedControl options={options} value="day" onChange={onChange} />);
  fireEvent.click(screen.getByText("Week"));
  expect(onChange).toHaveBeenCalledWith("week");
});

test("clicking a segment moves the active class in uncontrolled mode", () => {
  render(<SegmentedControl options={options} defaultValue="day" />);
  fireEvent.click(screen.getByText("Month"));
  expect(screen.getByText("Month").closest(".hx-segmented__item")).toHaveClass(
    "hx-segmented__item--active"
  );
  expect(screen.getByText("Day").closest(".hx-segmented__item")).not.toHaveClass(
    "hx-segmented__item--active"
  );
});

test("a disabled segment is not selectable via click", () => {
  const onChange = vi.fn();
  const withDisabled = [...options, { value: "year", label: "Year", disabled: true }];
  render(<SegmentedControl options={withDisabled} value="day" onChange={onChange} />);
  fireEvent.click(screen.getByText("Year"));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText("Year").closest('[role="radio"]')).toHaveAttribute("aria-disabled", "true");
});

test("disabled=true on the whole control disables every segment", () => {
  const onChange = vi.fn();
  render(<SegmentedControl options={options} value="day" onChange={onChange} disabled />);
  fireEvent.click(screen.getByText("Week"));
  expect(onChange).not.toHaveBeenCalled();
});

test("actionIcon renders only on the selected segment and its click fires onClick without changing selection", () => {
  const onActionClick = vi.fn();
  const onChange = vi.fn();
  const withAction = [
    {
      value: "day",
      label: "Day",
      actionIcon: { icon: "close", ariaLabel: "Remove day", onClick: onActionClick },
    },
    { value: "week", label: "Week" },
  ];
  render(<SegmentedControl options={withAction} value="day" onChange={onChange} />);

  expect(screen.getByRole("button", { name: "Remove day" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Remove day" }));
  expect(onActionClick).toHaveBeenCalledTimes(1);
  expect(onChange).not.toHaveBeenCalled();
});

test("actionIcon is absent from non-selected segments", () => {
  const withAction = [
    { value: "day", label: "Day", actionIcon: { icon: "close", ariaLabel: "Remove day", onClick: vi.fn() } },
    { value: "week", label: "Week" },
  ];
  render(<SegmentedControl options={withAction} value="week" />);
  expect(screen.queryByRole("button", { name: "Remove day" })).not.toBeInTheDocument();
});

test("ArrowRight moves selection to the next enabled segment and focuses it", () => {
  const onChange = vi.fn();
  render(<SegmentedControl options={options} value="day" onChange={onChange} />);
  const dayRadio = screen.getByText("Day").closest('[role="radio"]') as HTMLElement;
  dayRadio.focus();
  fireEvent.keyDown(dayRadio, { key: "ArrowRight" });
  expect(onChange).toHaveBeenCalledWith("week");
});

test("uses the first non-disabled option as the initial value when uncontrolled with no defaultValue", () => {
  const withLeadingDisabled = [
    { value: "day", label: "Day", disabled: true },
    { value: "week", label: "Week" },
  ];
  render(<SegmentedControl options={withLeadingDisabled} />);
  expect(screen.getByText("Week").closest(".hx-segmented__item")).toHaveClass(
    "hx-segmented__item--active"
  );
});

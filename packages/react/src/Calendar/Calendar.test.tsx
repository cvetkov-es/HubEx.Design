import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Calendar } from "./Calendar";

// All tests pass an explicit `month`/`value` so behavior never depends on the
// real clock (January 2026: Jan 1, 2026 is a Thursday, so the Monday-start
// 6-week grid runs from Dec 29, 2025 through Feb 8, 2026 — 42 day cells).
const JAN_15_2026 = new Date(2026, 0, 15);

test("renders 7 weekday header labels inside .hx-calendar__head", () => {
  render(<Calendar month={JAN_15_2026} onChange={vi.fn()} />);
  const head = document.querySelector(".hx-calendar__head");
  expect(head).toBeInTheDocument();
  expect(head!.querySelectorAll(".hx-calendar__weekday")).toHaveLength(7);
});

test("renders a fixed 42-cell (6-week) grid of day cells", () => {
  render(<Calendar month={JAN_15_2026} onChange={vi.fn()} />);
  expect(document.querySelectorAll(".hx-calendar__day")).toHaveLength(42);
});

test("clicking a day calls onChange with a Date equal to that day", () => {
  const onChange = vi.fn();
  render(<Calendar month={JAN_15_2026} onChange={onChange} />);
  fireEvent.click(document.querySelector('[data-date="2026-01-15"]')!);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 15));
});

test("clicking a leading adjacent-month day calls onChange with that day's real date", () => {
  const onChange = vi.fn();
  render(<Calendar month={JAN_15_2026} onChange={onChange} />);
  // Dec 29, 2025 (Monday) is the grid's first cell, from the previous month.
  const cell = document.querySelector('[data-date="2025-12-29"]')!;
  expect(cell).toHaveClass("hx-calendar__day--muted");
  fireEvent.click(cell);
  expect(onChange).toHaveBeenCalledWith(new Date(2025, 11, 29));
});

test("the value's day has hx-calendar__day--selected and no other day does", () => {
  render(<Calendar value={JAN_15_2026} month={JAN_15_2026} onChange={vi.fn()} />);
  const selected = document.querySelectorAll(".hx-calendar__day--selected");
  expect(selected).toHaveLength(1);
  expect(selected[0]).toHaveAttribute("data-date", "2026-01-15");
});

test("with no value, no day is marked selected", () => {
  render(<Calendar month={JAN_15_2026} onChange={vi.fn()} />);
  expect(document.querySelectorAll(".hx-calendar__day--selected")).toHaveLength(0);
});

test("next/previous month navigation changes the displayed month without calling onChange", () => {
  const onChange = vi.fn();
  render(<Calendar month={JAN_15_2026} onChange={onChange} />);
  expect(screen.getByText("January 2026")).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText("Next month"));
  expect(screen.getByText("February 2026")).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByLabelText("Previous month"));
  fireEvent.click(screen.getByLabelText("Previous month"));
  expect(screen.getByText("December 2025")).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

test("preserves custom className alongside the base class", () => {
  render(<Calendar month={JAN_15_2026} onChange={vi.fn()} className="custom" />);
  expect(document.querySelector(".hx-calendar")).toHaveClass("hx-calendar", "custom");
});

test("passes native attributes like data-testid and id through to the root element", () => {
  render(<Calendar month={JAN_15_2026} onChange={vi.fn()} data-testid="cal" id="cal-el" />);
  const root = document.querySelector(".hx-calendar")!;
  expect(root).toHaveAttribute("data-testid", "cal");
  expect(root).toHaveAttribute("id", "cal-el");
});

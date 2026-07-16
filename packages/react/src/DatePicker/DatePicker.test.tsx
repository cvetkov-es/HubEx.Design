import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { DatePicker } from "./DatePicker";

// Deterministic fixture date — never relies on the real clock.
const JAN_15_2026 = new Date(2026, 0, 15);

test("renders the placeholder and an empty value when no value is given", () => {
  render(<DatePicker onChange={vi.fn()} placeholder="Select a date" />);
  const input = screen.getByPlaceholderText("Select a date") as HTMLInputElement;
  expect(input.value).toBe("");
  expect(document.querySelector(".hx-calendar")).not.toBeInTheDocument();
});

test("renders the formatted value when a value is given", () => {
  render(<DatePicker value={JAN_15_2026} onChange={vi.fn()} />);
  const input = document.querySelector("input") as HTMLInputElement;
  expect(input.value).toBe("15.01.2026");
});

test("clicking the input opens the calendar in a portal", () => {
  const { container } = render(<DatePicker value={JAN_15_2026} onChange={vi.fn()} />);
  const input = document.querySelector("input")!;
  fireEvent.click(input);
  expect(document.body.querySelector(".hx-calendar")).toBeInTheDocument();
  // the popover is portalled to document.body, not rendered inside the component's own container
  expect(container.querySelector(".hx-calendar")).not.toBeInTheDocument();
});

test("selecting a day calls onChange with that date and closes the popover", () => {
  const onChange = vi.fn();
  render(<DatePicker value={JAN_15_2026} onChange={onChange} />);
  const input = document.querySelector("input") as HTMLInputElement;
  fireEvent.click(input);

  fireEvent.click(document.querySelector('[data-date="2026-01-20"]')!);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20));
  expect(document.querySelector(".hx-calendar")).not.toBeInTheDocument();
});

// DatePicker is a fully controlled component (like Select/Checkbox elsewhere
// in this package) — it never manages the displayed value itself, so this
// test drives it through a small stateful wrapper the way a real consumer
// would, to verify the input actually reflects a new `value` after onChange.
function ControlledDatePicker({ onChange }: { onChange: (d: Date) => void }) {
  const [value, setValue] = React.useState<Date>(JAN_15_2026);
  return (
    <DatePicker
      value={value}
      onChange={(d) => {
        setValue(d);
        onChange(d);
      }}
    />
  );
}

test("fills the input text once the consumer applies the new value from onChange", () => {
  const onChange = vi.fn();
  render(<ControlledDatePicker onChange={onChange} />);
  const input = document.querySelector("input") as HTMLInputElement;
  expect(input.value).toBe("15.01.2026");

  fireEvent.click(input);
  fireEvent.click(document.querySelector('[data-date="2026-01-20"]')!);

  expect(input.value).toBe("20.01.2026");
});

test("closes when clicking outside the popover", () => {
  render(
    <div>
      <DatePicker value={JAN_15_2026} onChange={vi.fn()} />
      <button>Outside</button>
    </div>
  );
  fireEvent.click(document.querySelector("input")!);
  expect(document.querySelector(".hx-calendar")).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByText("Outside"));
  expect(document.querySelector(".hx-calendar")).not.toBeInTheDocument();
});

test("closes on Escape", () => {
  render(<DatePicker value={JAN_15_2026} onChange={vi.fn()} />);
  fireEvent.click(document.querySelector("input")!);
  expect(document.querySelector(".hx-calendar")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(document.querySelector(".hx-calendar")).not.toBeInTheDocument();
});

test("preserves custom className alongside the base class on the input", () => {
  render(<DatePicker onChange={vi.fn()} className="custom" />);
  const input = document.querySelector("input")!;
  expect(input).toHaveClass("hx-input", "hx-datepicker", "custom");
});

test("passes native attributes like data-testid and id through to the input", () => {
  render(<DatePicker onChange={vi.fn()} data-testid="due-date" id="due-date-el" />);
  const input = document.querySelector("input")!;
  expect(input).toHaveAttribute("data-testid", "due-date");
  expect(input).toHaveAttribute("id", "due-date-el");
});

test("forwards the ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<DatePicker ref={ref} onChange={vi.fn()} />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});

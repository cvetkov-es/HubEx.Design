import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Search } from "./Search";

test("renders an InputBase with a search icon in the left slot", () => {
  render(<Search value="" onChange={() => {}} />);
  const input = screen.getByRole("textbox", { name: "Search" });
  expect(input).toHaveClass("hx-inputbase", "hx-search");
  expect(input.closest(".hx-inputbase-control")?.querySelector(".hx-inputbase__left")).not.toBeNull();
});

test("value/onChange is controlled", () => {
  const onChange = vi.fn();
  render(<Search value="hello" onChange={onChange} />);
  const input = screen.getByRole("textbox") as HTMLInputElement;
  expect(input.value).toBe("hello");
  fireEvent.change(input, { target: { value: "hello!" } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

test("accessible name defaults to 'Search' when neither ariaLabel nor placeholder is given", () => {
  render(<Search value="" onChange={() => {}} />);
  expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
});

test("custom placeholder passes through", () => {
  render(<Search value="" onChange={() => {}} placeholder="Find a user" />);
  expect(screen.getByPlaceholderText("Find a user")).toBeInTheDocument();
});

test("ariaLabel overrides the accessible name", () => {
  render(<Search value="" onChange={() => {}} placeholder="Find a user" ariaLabel="User search" />);
  expect(screen.getByRole("textbox", { name: "User search" })).toBeInTheDocument();
});

test("shows a clear affordance when there is a value, that clears via onChange", () => {
  let receivedValue: string | undefined;
  const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
    receivedValue = event.target.value;
  });
  render(<Search value="hello" onChange={onChange} />);
  const clearBtn = screen.getByRole("button", { name: /clear/i });
  fireEvent.click(clearBtn);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(receivedValue).toBe("");
});

test("clear affordance is not interactive when there is no value", () => {
  render(<Search value="" onChange={() => {}} />);
  // aria-hidden="true" removes it from the accessible-name computation
  // entirely, so it's queried by role alone (there is only one button).
  const clearBtn = screen.getByRole("button", { hidden: true });
  expect(clearBtn).toHaveAttribute("tabIndex", "-1");
  expect(clearBtn).toHaveAttribute("aria-hidden", "true");
  expect(clearBtn).toHaveStyle({ visibility: "hidden" });
});

test("errorText passes through to InputBase", () => {
  render(<Search value="" onChange={() => {}} errorText="Something went wrong" />);
  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("fullWidth passes through to InputBase's wrapper", () => {
  render(<Search value="" onChange={() => {}} fullWidth />);
  const input = screen.getByRole("textbox");
  expect(input.closest(".hx-inputbase-wrap")).toHaveClass("hx-inputbase--full");
});

test("name passes through to the underlying input", () => {
  render(<Search value="" onChange={() => {}} name="q" />);
  expect(screen.getByRole("textbox")).toHaveAttribute("name", "q");
});

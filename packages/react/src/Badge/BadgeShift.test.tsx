import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { BadgeShift } from "./BadgeShift";

test("defaults to offline status and xl size", () => {
  render(<BadgeShift data-testid="shift" />);
  expect(screen.getByTestId("shift")).toHaveClass(
    "hx-badge-shift",
    "hx-badge-shift--offline",
    "hx-badge-shift--xl"
  );
});

test.each(["online", "offline"] as const)("status=%s renders the matching modifier class", (status) => {
  render(<BadgeShift data-testid="shift" status={status} />);
  expect(screen.getByTestId("shift")).toHaveClass(`hx-badge-shift--${status}`);
});

test.each(["xl", "l", "m", "s"] as const)("size=%s renders the matching modifier class", (size) => {
  render(<BadgeShift data-testid="shift" size={size} />);
  expect(screen.getByTestId("shift")).toHaveClass(`hx-badge-shift--${size}`);
});

test("sets aria-label when provided", () => {
  render(<BadgeShift ariaLabel="Online" />);
  expect(screen.getByLabelText("Online")).toBeInTheDocument();
});

test("without tooltipContent, renders no tooltip on hover", () => {
  render(<BadgeShift data-testid="shift" />);
  fireEvent.mouseEnter(screen.getByTestId("shift"));
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("with tooltipContent, shows the tooltip on hover with the given placement", () => {
  render(<BadgeShift tooltipContent="Online now" tooltipPlacement="left" data-testid="shift" />);
  fireEvent.mouseEnter(screen.getByTestId("shift"));
  expect(screen.getByText("Online now")).toBeInTheDocument();
  expect(screen.getByText("Online now")).toHaveClass("hx-tooltip--left");
});

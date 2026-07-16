import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Tooltip } from "./Tooltip";

test("tooltip content is not shown initially", () => {
  render(
    <Tooltip content="Helpful hint">
      <button>Trigger</button>
    </Tooltip>
  );
  expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
});

test("shows tooltip content on mouse enter and hides on mouse leave", () => {
  render(
    <Tooltip content="Helpful hint">
      <button>Trigger</button>
    </Tooltip>
  );
  fireEvent.mouseEnter(screen.getByText("Trigger"));
  expect(screen.getByText("Helpful hint")).toBeInTheDocument();
  expect(screen.getByText("Helpful hint")).toHaveClass("hx-tooltip");

  fireEvent.mouseLeave(screen.getByText("Trigger"));
  expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
});

test("preserves the trigger element's own props (e.g. className)", () => {
  render(
    <Tooltip content="Helpful hint">
      <button className="custom">Trigger</button>
    </Tooltip>
  );
  expect(screen.getByText("Trigger")).toHaveClass("custom");
});

test("shows tooltip content on focus and hides on blur", () => {
  render(
    <Tooltip content="Helpful hint">
      <button>Trigger</button>
    </Tooltip>
  );
  fireEvent.focus(screen.getByText("Trigger"));
  expect(screen.getByText("Helpful hint")).toBeInTheDocument();

  fireEvent.blur(screen.getByText("Trigger"));
  expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
});

import { render, screen, fireEvent, act } from "@testing-library/react";
import * as React from "react";
import { Popover } from "./Popover";

test("panel is not shown initially (uncontrolled, default click trigger)", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
});

test("click trigger toggles the panel open and closed", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
});

test("click-outside closes an open popover", () => {
  render(
    <div>
      <Popover content="Panel content">
        <button>Trigger</button>
      </Popover>
      <button>Outside</button>
    </div>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByText("Outside"));
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
});

test("Escape key closes an open popover", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
});

test("hover trigger opens the panel on mouseenter and closes (after the close delay) on mouseleave", () => {
  vi.useFakeTimers();
  try {
    render(
      <Popover content="Panel content" trigger="hover">
        <button>Trigger</button>
      </Popover>
    );
    fireEvent.mouseEnter(screen.getByText("Trigger"));
    expect(screen.getByText("Panel content")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Trigger"));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

test("click trigger does not open on hover", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.mouseEnter(screen.getByText("Trigger"));
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
});

test("respects controlled `open` prop and fires onOpenChange instead of toggling internally", () => {
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <Popover content="Panel content" open={false} onOpenChange={onOpenChange}>
      <button>Trigger</button>
    </Popover>
  );
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Trigger"));
  expect(onOpenChange).toHaveBeenCalledWith(true);
  // Controlled: internal click must NOT flip visibility on its own.
  expect(screen.queryByText("Panel content")).not.toBeInTheDocument();

  rerender(
    <Popover content="Panel content" open={true} onOpenChange={onOpenChange}>
      <button>Trigger</button>
    </Popover>
  );
  expect(screen.getByText("Panel content")).toBeInTheDocument();
});

test.each(["top", "bottom", "left", "right"] as const)(
  "placement=%s renders the matching modifier class",
  (placement) => {
    render(
      <Popover content="Panel content" placement={placement}>
        <button>Trigger</button>
      </Popover>
    );
    fireEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Panel content")).toHaveClass(`hx-popover--${placement}`);
  }
);

test("defaults to bottom placement", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toHaveClass("hx-popover--bottom");
});

test("size prop applies the matching panel size class", () => {
  render(
    <Popover content="Panel content" size="l">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toHaveClass("hx-popover--l");
});

test("panel has role dialog by default", () => {
  render(
    <Popover content="Panel content">
      <button>Trigger</button>
    </Popover>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Panel content")).toHaveAttribute("role", "dialog");
});

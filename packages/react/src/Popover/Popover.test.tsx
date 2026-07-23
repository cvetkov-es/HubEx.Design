import { render, screen, fireEvent, act } from "@testing-library/react";
import * as React from "react";
import { Popover, type PopoverTrigger } from "./Popover";

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

test("Escape does not close a trigger='manual' popover (opts out of built-in open/close wiring)", () => {
  render(
    // Cast mirrors Dropdown's own pass-through of unrecognized trigger
    // literals (see Dropdown.tsx) — Popover's own type only allows
    // click/hover/click-hover, but at runtime an unrecognized value falls
    // through to neither, same as Dropdown's 'manual'.
    <Popover content="Panel content" trigger={"manual" as unknown as PopoverTrigger} open={true}>
      <button>Trigger</button>
    </Popover>
  );
  expect(screen.getByText("Panel content")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByText("Panel content")).toBeInTheDocument();
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

test("hover trigger stays open when the pointer moves onto the panel", () => {
  vi.useFakeTimers();
  try {
    render(
      <Popover content="Panel content" trigger="hover">
        <button>Trigger</button>
      </Popover>
    );
    fireEvent.mouseEnter(screen.getByText("Trigger"));
    expect(screen.getByText("Panel content")).toBeInTheDocument();

    // Pointer leaves the trigger (starts the close timer)...
    fireEvent.mouseLeave(screen.getByText("Trigger"));
    // ...then lands on the panel before the timer fires.
    fireEvent.mouseEnter(screen.getByText("Panel content"));

    act(() => {
      vi.runAllTimers();
    });
    // No pending timer should have survived the panel mouseenter.
    expect(screen.getByText("Panel content")).toBeInTheDocument();

    // Leaving the panel itself still closes it (after the delay).
    fireEvent.mouseLeave(screen.getByText("Panel content"));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

test("hover trigger stays open when focus moves into panel content", () => {
  vi.useFakeTimers();
  try {
    render(
      <Popover content={<button>Panel button</button>} trigger="hover">
        <button>Trigger</button>
      </Popover>
    );
    fireEvent.mouseEnter(screen.getByText("Trigger"));
    expect(screen.getByText("Panel button")).toBeInTheDocument();

    // Trigger loses focus/hover as the user tabs into the panel content.
    fireEvent.mouseLeave(screen.getByText("Trigger"));
    fireEvent.focus(screen.getByText("Panel button"));

    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText("Panel button")).toBeInTheDocument();
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

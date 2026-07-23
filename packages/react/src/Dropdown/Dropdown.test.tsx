import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Dropdown } from "./Dropdown";

test("menu is not shown initially and opens/closes on trigger click", () => {
  render(
    <Dropdown content={<div>Menu item</div>}>
      <button>Trigger</button>
    </Dropdown>
  );
  expect(screen.queryByText("Menu item")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Menu item")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.queryByText("Menu item")).not.toBeInTheDocument();
});

test("panel role defaults to menu", () => {
  render(
    <Dropdown content={<div>Menu item</div>}>
      <button>Trigger</button>
    </Dropdown>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Menu item").closest(".hx-dropdown")).toHaveAttribute("role", "menu");
});

test.each(["listbox", "dialog"] as const)("role=%s sets the panel role", (role) => {
  render(
    <Dropdown content={<div>Menu item</div>} role={role}>
      <button>Trigger</button>
    </Dropdown>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Menu item").closest(".hx-dropdown")).toHaveAttribute("role", role);
});

test("role='none' omits the role attribute on the panel", () => {
  render(
    <Dropdown content={<div>Menu item</div>} role="none">
      <button>Trigger</button>
    </Dropdown>
  );
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Menu item").closest(".hx-dropdown")).not.toHaveAttribute("role");
});

test("applyTriggerAria (default true) sets aria-haspopup and aria-expanded on the trigger", () => {
  render(
    <Dropdown content={<div>Menu item</div>}>
      <button>Trigger</button>
    </Dropdown>
  );
  const trigger = screen.getByText("Trigger");
  expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("applyTriggerAria=false leaves the trigger's own aria untouched", () => {
  render(
    <Dropdown content={<div>Menu item</div>} applyTriggerAria={false}>
      <button aria-haspopup="listbox">Trigger</button>
    </Dropdown>
  );
  const trigger = screen.getByText("Trigger");
  expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  expect(trigger).not.toHaveAttribute("aria-expanded");
});

test("ariaHasPopup overrides the role-derived default", () => {
  render(
    <Dropdown content={<div>Menu item</div>} ariaHasPopup="dialog">
      <button>Trigger</button>
    </Dropdown>
  );
  expect(screen.getByText("Trigger")).toHaveAttribute("aria-haspopup", "dialog");
});

test("respects controlled open + onOpenChange", () => {
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <Dropdown content={<div>Menu item</div>} open={false} onOpenChange={onOpenChange}>
      <button>Trigger</button>
    </Dropdown>
  );
  expect(screen.queryByText("Menu item")).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Trigger"));
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByText("Menu item")).not.toBeInTheDocument();

  rerender(
    <Dropdown content={<div>Menu item</div>} open={true} onOpenChange={onOpenChange}>
      <button>Trigger</button>
    </Dropdown>
  );
  expect(screen.getByText("Menu item")).toBeInTheDocument();
});

test("trigger='manual' ignores clicks; only the controlled open prop drives visibility", () => {
  render(
    <Dropdown content={<div>Menu item</div>} trigger="manual" open={true}>
      <button>Trigger</button>
    </Dropdown>
  );
  expect(screen.getByText("Menu item")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Menu item")).toBeInTheDocument();
});

test("clicking a menu item inside content can close the dropdown via onOpenChange", () => {
  function Harness() {
    const [open, setOpen] = React.useState(false);
    return (
      <Dropdown
        content={<button onClick={() => setOpen(false)}>Item 1</button>}
        open={open}
        onOpenChange={setOpen}
      >
        <button onClick={() => setOpen((o) => !o)}>Trigger</button>
      </Dropdown>
    );
  }
  render(<Harness />);
  fireEvent.click(screen.getByText("Trigger"));
  expect(screen.getByText("Item 1")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Item 1"));
  expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
});

test.each(["top", "bottom", "left", "right"] as const)(
  "placement=%s renders the matching modifier class",
  (placement) => {
    render(
      <Dropdown content={<div>Menu item</div>} placement={placement}>
        <button>Trigger</button>
      </Dropdown>
    );
    fireEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Menu item").closest(".hx-dropdown")).toHaveClass(
      `hx-dropdown--${placement}`
    );
  }
);

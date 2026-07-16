import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Menu } from "./Menu";

const items = [
  { label: "Edit", onSelect: vi.fn() },
  { label: "Delete", onSelect: vi.fn() }
];

test("menu items are hidden until the trigger is clicked", () => {
  render(<Menu trigger={<span>Actions</span>} items={items} />);
  expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  expect(screen.queryByText("Delete")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Actions"));
  expect(screen.getByText("Edit")).toBeInTheDocument();
  expect(screen.getByText("Delete")).toBeInTheDocument();
  expect(document.querySelector(".hx-menu")).toBeInTheDocument();
});

test("clicking a menu item calls its onSelect and closes the menu", () => {
  const onSelect = vi.fn();
  render(<Menu trigger={<span>Actions</span>} items={[{ label: "Edit", onSelect }]} />);
  fireEvent.click(screen.getByText("Actions"));
  fireEvent.click(screen.getByText("Edit"));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Edit")).not.toBeInTheDocument();
});

test("closes when clicking outside the menu", () => {
  render(
    <div>
      <Menu trigger={<span>Actions</span>} items={items} />
      <button>Outside</button>
    </div>
  );
  fireEvent.click(screen.getByText("Actions"));
  expect(screen.getByText("Edit")).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByText("Outside"));
  expect(screen.queryByText("Edit")).not.toBeInTheDocument();
});

test("preserves custom className on the item list alongside the base class", () => {
  render(<Menu trigger={<span>Actions</span>} items={items} className="custom" />);
  fireEvent.click(screen.getByText("Actions"));
  expect(document.querySelector(".hx-menu")).toHaveClass("hx-menu", "custom");
});

test("closes on Escape", () => {
  render(<Menu trigger={<span>Actions</span>} items={items} />);
  fireEvent.click(screen.getByText("Actions"));
  expect(screen.getByText("Edit")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByText("Edit")).not.toBeInTheDocument();
});

import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Drawer } from "./Drawer";

test("renders nothing in the DOM when open is false", () => {
  render(
    <Drawer open={false} onClose={vi.fn()}>
      Drawer content
    </Drawer>
  );
  expect(screen.queryByText("Drawer content")).not.toBeInTheDocument();
  expect(document.querySelector(".hx-drawer")).not.toBeInTheDocument();
});

test("renders children when open is true, default side right", () => {
  render(
    <Drawer open onClose={vi.fn()}>
      Drawer content
    </Drawer>
  );
  expect(screen.getByText("Drawer content")).toBeInTheDocument();
  const panel = document.querySelector(".hx-drawer");
  expect(panel).toBeInTheDocument();
  expect(panel).toHaveClass("hx-drawer--right");
});

test("applies the left side modifier class", () => {
  render(
    <Drawer open onClose={vi.fn()} side="left">
      Drawer content
    </Drawer>
  );
  expect(document.querySelector(".hx-drawer")).toHaveClass("hx-drawer--left");
});

test("preserves custom className alongside the base and side classes", () => {
  render(
    <Drawer open onClose={vi.fn()} className="custom">
      Drawer content
    </Drawer>
  );
  expect(document.querySelector(".hx-drawer")).toHaveClass("hx-drawer", "hx-drawer--right", "custom");
});

test("passes native attributes like data-testid and id through to the panel", () => {
  render(
    <Drawer open onClose={vi.fn()} data-testid="side-drawer" id="side-drawer-el">
      Drawer content
    </Drawer>
  );
  const panel = document.querySelector(".hx-drawer")!;
  expect(panel).toHaveAttribute("data-testid", "side-drawer");
  expect(panel).toHaveAttribute("id", "side-drawer-el");
});

test("calls onClose when Escape is pressed", () => {
  const onClose = vi.fn();
  render(
    <Drawer open onClose={onClose}>
      Drawer content
    </Drawer>
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("calls onClose when the backdrop is clicked", () => {
  const onClose = vi.fn();
  render(
    <Drawer open onClose={onClose}>
      Drawer content
    </Drawer>
  );
  fireEvent.click(document.querySelector(".hx-drawer__backdrop")!);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not call onClose when clicking inside the panel", () => {
  const onClose = vi.fn();
  render(
    <Drawer open onClose={onClose}>
      Drawer content
    </Drawer>
  );
  fireEvent.click(screen.getByText("Drawer content"));
  expect(onClose).not.toHaveBeenCalled();
});

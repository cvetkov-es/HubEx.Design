import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Info } from "./Info";

test("renders an info icon trigger and hides content initially", () => {
  render(<Info content="Helpful explanation" />);
  expect(screen.getByRole("button", { name: "Information" })).toBeInTheDocument();
  expect(screen.queryByText("Helpful explanation")).not.toBeInTheDocument();
});

test("clicking the icon trigger shows the content (default trigger=click)", () => {
  render(<Info content="Helpful explanation" />);
  fireEvent.click(screen.getByRole("button", { name: "Information" }));
  expect(screen.getByText("Helpful explanation")).toBeInTheDocument();
});

test("custom ariaLabel overrides the default trigger accessible name", () => {
  render(<Info content="Helpful explanation" ariaLabel="More info" />);
  expect(screen.getByRole("button", { name: "More info" })).toBeInTheDocument();
});

test.each(["top", "bottom", "left", "right"] as const)(
  "placement=%s renders the matching modifier class",
  (placement) => {
    render(<Info content="Helpful explanation" placement={placement} />);
    fireEvent.click(screen.getByRole("button", { name: "Information" }));
    expect(screen.getByText("Helpful explanation").closest(".hx-popover")).toHaveClass(
      `hx-popover--${placement}`
    );
  }
);

test("defaults to bottom placement", () => {
  render(<Info content="Helpful explanation" />);
  fireEvent.click(screen.getByRole("button", { name: "Information" }));
  expect(screen.getByText("Helpful explanation").closest(".hx-popover")).toHaveClass(
    "hx-popover--bottom"
  );
});

test("respects controlled open + onOpenChange", () => {
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <Info content="Helpful explanation" open={false} onOpenChange={onOpenChange} />
  );
  expect(screen.queryByText("Helpful explanation")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Information" }));
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByText("Helpful explanation")).not.toBeInTheDocument();

  rerender(<Info content="Helpful explanation" open={true} onOpenChange={onOpenChange} />);
  expect(screen.getByText("Helpful explanation")).toBeInTheDocument();
});

test("trigger='hover' opens on mouseenter", () => {
  render(<Info content="Helpful explanation" trigger="hover" />);
  fireEvent.mouseEnter(screen.getByRole("button", { name: "Information" }));
  expect(screen.getByText("Helpful explanation")).toBeInTheDocument();
});

test("maxWidth/maxHeight are applied as inline styles on the panel", () => {
  render(<Info content="Helpful explanation" maxWidth={200} maxHeight={100} />);
  fireEvent.click(screen.getByRole("button", { name: "Information" }));
  const panel = screen.getByText("Helpful explanation").closest(".hx-popover") as HTMLElement;
  expect(panel.style.maxWidth).toBe("200px");
  expect(panel.style.maxHeight).toBe("100px");
});

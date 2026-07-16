import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Breadcrumbs } from "./Breadcrumbs";

const items = [
  { label: "Objects", href: "/objects" },
  { label: "BC Avenue", href: "/objects/bc-avenue" },
  { label: "Office 802" }
];

test("renders a nav with the base class", () => {
  render(<Breadcrumbs items={items} />);
  expect(screen.getByRole("navigation")).toHaveClass("hx-breadcrumbs");
});

test("renders an anchor for items with href", () => {
  render(<Breadcrumbs items={items} />);
  const link = screen.getByRole("link", { name: "Objects" });
  expect(link.tagName).toBe("A");
  expect(link).toHaveAttribute("href", "/objects");
});

test("renders a span for items without href", () => {
  render(<Breadcrumbs items={items} />);
  const current = screen.getByText("Office 802");
  expect(current.tagName).toBe("SPAN");
});

test("renders every item's label", () => {
  render(<Breadcrumbs items={items} />);
  expect(screen.getByText("Objects")).toBeInTheDocument();
  expect(screen.getByText("BC Avenue")).toBeInTheDocument();
  expect(screen.getByText("Office 802")).toBeInTheDocument();
});

test("preserves custom className alongside the base class", () => {
  render(<Breadcrumbs items={items} className="custom" />);
  expect(screen.getByRole("navigation")).toHaveClass("hx-breadcrumbs", "custom");
});

test("passes native attributes like data-testid and id through to the nav", () => {
  render(<Breadcrumbs items={items} data-testid="crumbs" id="crumbs-el" />);
  const nav = screen.getByRole("navigation");
  expect(nav).toHaveAttribute("data-testid", "crumbs");
  expect(nav).toHaveAttribute("id", "crumbs-el");
});

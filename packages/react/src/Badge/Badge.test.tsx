import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Badge } from "./Badge";

test("defaults to the tag variant", () => {
  render(<Badge>New</Badge>);
  expect(document.querySelector(".hx-badge")).toHaveClass("hx-badge", "hx-badge--tag");
});

test("variant=count renders the count", () => {
  render(<Badge variant="count" count={5} />);
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(document.querySelector(".hx-badge")).toHaveClass("hx-badge--count");
});

test("variant=dot renders no visible count text", () => {
  render(<Badge variant="dot" />);
  const badge = document.querySelector(".hx-badge");
  expect(badge).toHaveClass("hx-badge--dot");
  expect(badge?.textContent).toBe("");
});

test("preserves custom className alongside the base class", () => {
  render(<Badge className="custom">New</Badge>);
  expect(document.querySelector(".hx-badge")).toHaveClass("hx-badge", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Badge data-testid="badge-el">New</Badge>);
  expect(screen.getByTestId("badge-el")).toBeInTheDocument();
});

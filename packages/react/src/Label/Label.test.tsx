import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Label } from "./Label";

test("renders children with the base class", () => {
  render(<Label>Object type</Label>);
  expect(screen.getByText("Object type")).toHaveClass("hx-label");
});

test("preserves custom className alongside the base class", () => {
  render(<Label className="custom">Object type</Label>);
  expect(screen.getByText("Object type")).toHaveClass("hx-label", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Label data-testid="label-el">Object type</Label>);
  expect(screen.getByTestId("label-el")).toBeInTheDocument();
});

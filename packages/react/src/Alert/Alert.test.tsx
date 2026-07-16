import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Alert } from "./Alert";

test("defaults to the info severity", () => {
  render(<Alert>Something happened</Alert>);
  expect(document.querySelector(".hx-alert")).toHaveClass("hx-alert", "hx-alert--info");
});

test("severity=danger applies the hx-alert--danger class", () => {
  render(<Alert severity="danger">Failed to save</Alert>);
  expect(document.querySelector(".hx-alert")).toHaveClass("hx-alert--danger");
});

test("renders the title and children", () => {
  render(
    <Alert severity="success" title="Saved">
      Your changes were saved.
    </Alert>
  );
  expect(screen.getByText("Saved")).toBeInTheDocument();
  expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
  expect(document.querySelector(".hx-alert")).toHaveClass("hx-alert--success");
});

test("applies the warning severity class", () => {
  render(<Alert severity="warning">Careful</Alert>);
  expect(document.querySelector(".hx-alert")).toHaveClass("hx-alert--warning");
});

test("preserves custom className alongside the base class", () => {
  render(<Alert className="custom">Something happened</Alert>);
  expect(document.querySelector(".hx-alert")).toHaveClass("hx-alert", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Alert data-testid="alert-el">Something happened</Alert>);
  expect(screen.getByTestId("alert-el")).toBeInTheDocument();
});

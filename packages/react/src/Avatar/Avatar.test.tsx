import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Avatar } from "./Avatar";

test("renders initials from name when no src is given", () => {
  render(<Avatar name="Alex Petrov" />);
  expect(screen.getByText("AP")).toBeInTheDocument();
  expect(document.querySelector("img")).not.toBeInTheDocument();
});

test("renders a single initial for a one-word name", () => {
  render(<Avatar name="Cher" />);
  expect(screen.getByText("C")).toBeInTheDocument();
});

test("renders an img with src and alt=name when src is given", () => {
  render(<Avatar name="Alex Petrov" src="https://example.com/a.png" />);
  const img = screen.getByRole("img", { name: "Alex Petrov" });
  expect(img).toHaveAttribute("src", "https://example.com/a.png");
  expect(screen.queryByText("AP")).not.toBeInTheDocument();
});

test("applies the base class and defaults to md size", () => {
  render(<Avatar name="Alex Petrov" />);
  expect(document.querySelector(".hx-avatar")).toHaveClass("hx-avatar", "hx-avatar--md");
});

test("applies the sm size modifier class", () => {
  render(<Avatar name="Alex Petrov" size="sm" />);
  expect(document.querySelector(".hx-avatar")).toHaveClass("hx-avatar--sm");
});

test("preserves custom className alongside the base class", () => {
  render(<Avatar name="Alex Petrov" className="custom" />);
  expect(document.querySelector(".hx-avatar")).toHaveClass("hx-avatar", "custom");
});

test("passes native attributes like data-testid through to the root", () => {
  render(<Avatar name="Alex Petrov" data-testid="avatar-el" />);
  expect(screen.getByTestId("avatar-el")).toBeInTheDocument();
});

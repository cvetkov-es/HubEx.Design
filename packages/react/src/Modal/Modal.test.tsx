import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Modal } from "./Modal";

test("renders nothing in the DOM when open is false", () => {
  render(
    <Modal open={false} onClose={vi.fn()} title="Delete contract">
      Body text
    </Modal>
  );
  expect(screen.queryByText("Body text")).not.toBeInTheDocument();
  expect(screen.queryByText("Delete contract")).not.toBeInTheDocument();
  expect(document.querySelector(".hx-modal")).not.toBeInTheDocument();
});

test("renders title and children when open is true", () => {
  render(
    <Modal open onClose={vi.fn()} title="Delete contract">
      Body text
    </Modal>
  );
  expect(screen.getByText("Delete contract")).toBeInTheDocument();
  expect(screen.getByText("Body text")).toBeInTheDocument();
  expect(document.querySelector(".hx-modal")).toBeInTheDocument();
  expect(document.querySelector(".hx-modal__backdrop")).toBeInTheDocument();
});

test("calls onClose when Escape is pressed", () => {
  const onClose = vi.fn();
  render(
    <Modal open onClose={onClose} title="Delete contract">
      Body text
    </Modal>
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("calls onClose when the backdrop is clicked", () => {
  const onClose = vi.fn();
  render(
    <Modal open onClose={onClose} title="Delete contract">
      Body text
    </Modal>
  );
  fireEvent.click(document.querySelector(".hx-modal__backdrop")!);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not call onClose when clicking inside the panel", () => {
  const onClose = vi.fn();
  render(
    <Modal open onClose={onClose} title="Delete contract">
      Body text
    </Modal>
  );
  fireEvent.click(screen.getByText("Body text"));
  expect(onClose).not.toHaveBeenCalled();
});

test("preserves custom className alongside the base class", () => {
  render(
    <Modal open onClose={vi.fn()} className="custom">
      Body text
    </Modal>
  );
  expect(document.querySelector(".hx-modal")).toHaveClass("hx-modal", "custom");
});

test("passes native attributes like data-testid and id through to the panel", () => {
  render(
    <Modal open onClose={vi.fn()} title="Delete contract" data-testid="delete-modal" id="delete-modal-el">
      Body text
    </Modal>
  );
  const panel = document.querySelector(".hx-modal")!;
  expect(panel).toHaveAttribute("data-testid", "delete-modal");
  expect(panel).toHaveAttribute("id", "delete-modal-el");
});

test("does not allow a consumer-passed role to override the controlled role=dialog", () => {
  render(
    <Modal open onClose={vi.fn()} title="Delete contract" role="alertdialog">
      Body text
    </Modal>
  );
  const panel = document.querySelector(".hx-modal")!;
  expect(panel).toHaveAttribute("role", "dialog");
});

test("a consumer-provided aria-label survives when no title is given", () => {
  render(
    <Modal open onClose={vi.fn()} aria-label="Custom">
      Body text
    </Modal>
  );
  const panel = document.querySelector(".hx-modal")!;
  expect(panel).toHaveAttribute("aria-label", "Custom");
});

test("renders into a portal at document.body", () => {
  const { container } = render(
    <Modal open onClose={vi.fn()} title="Delete contract">
      Body text
    </Modal>
  );
  expect(container).toBeEmptyDOMElement();
  expect(document.body.querySelector(".hx-modal")).toBeInTheDocument();
});

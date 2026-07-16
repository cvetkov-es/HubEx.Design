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

test("renders into a portal at document.body", () => {
  const { container } = render(
    <Modal open onClose={vi.fn()} title="Delete contract">
      Body text
    </Modal>
  );
  expect(container).toBeEmptyDOMElement();
  expect(document.body.querySelector(".hx-modal")).toBeInTheDocument();
});

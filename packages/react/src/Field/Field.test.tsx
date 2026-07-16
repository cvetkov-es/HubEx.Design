import { render, screen } from "@testing-library/react";
import { Field } from "./Field";

test("renders base class and children", () => {
  render(
    <Field>
      <input placeholder="child" />
    </Field>
  );
  expect(screen.getByPlaceholderText("child").parentElement).toHaveClass("hx-field");
});

test("renders a label associated with htmlFor", () => {
  render(
    <Field label="Name" htmlFor="name-input">
      <input id="name-input" placeholder="child" />
    </Field>
  );
  const label = screen.getByText("Name");
  expect(label).toHaveClass("hx-label");
  expect(label).toHaveAttribute("for", "name-input");
});

test("omits label element when no label prop given", () => {
  render(
    <Field>
      <input placeholder="child" />
    </Field>
  );
  expect(screen.queryByText("Name")).not.toBeInTheDocument();
});

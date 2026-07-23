import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Text } from "./Text";

test("renders children inside a <p>", () => {
  render(<Text variant="font-body-regular">Hello</Text>);
  const el = screen.getByText("Hello");
  expect(el.tagName).toBe("P");
});

test("applies the variant class hx-text--<variant>", () => {
  render(<Text variant="font-body-regular">Hello</Text>);
  expect(screen.getByText("Hello")).toHaveClass("hx-text", "hx-text--font-body-regular");
});

test("each of the 11 official variants maps to its own hx-text--<variant> class", () => {
  const variants = [
    "font-H0",
    "font-H1",
    "font-H2",
    "font-H3",
    "font-body-regular",
    "font-body-medium",
    "font-paragraph-regular",
    "font-paragraph-medium",
    "font-tooltip-regular",
    "font-tooltip-medium",
    "font-caption-regular",
  ] as const;
  render(
    <>
      {variants.map((v) => (
        <Text key={v} variant={v}>
          {v}
        </Text>
      ))}
    </>
  );
  for (const v of variants) {
    expect(screen.getByText(v)).toHaveClass(`hx-text--${v}`);
  }
});

test("color prop applies the hx-text--<color> class", () => {
  render(
    <Text variant="font-body-regular" color="color-text-error">
      Danger
    </Text>
  );
  expect(screen.getByText("Danger")).toHaveClass("hx-text--color-text-error");
});

test("omitting color applies no color modifier class (CSS default handles it)", () => {
  render(<Text variant="font-body-regular">Plain</Text>);
  const el = screen.getByText("Plain");
  expect(el.className).not.toMatch(/hx-text--color-/);
});

test("ellipsis applies the hx-text--ellipsis class", () => {
  render(
    <Text variant="font-body-regular" ellipsis>
      Truncate me
    </Text>
  );
  expect(screen.getByText("Truncate me")).toHaveClass("hx-text--ellipsis");
});

test("omitting ellipsis applies no ellipsis class", () => {
  render(<Text variant="font-body-regular">Full</Text>);
  expect(screen.getByText("Full")).not.toHaveClass("hx-text--ellipsis");
});

test("preserves a custom className alongside the generated classes", () => {
  render(
    <Text variant="font-body-regular" className="custom">
      Custom
    </Text>
  );
  expect(screen.getByText("Custom")).toHaveClass("hx-text", "custom");
});

test("forwards ref to the underlying <p> element", () => {
  const ref = React.createRef<HTMLParagraphElement>();
  render(
    <Text variant="font-body-regular" ref={ref}>
      Ref
    </Text>
  );
  expect(ref.current).toBe(screen.getByText("Ref"));
});

import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { InputBase } from "./InputBase";

test("renders with base class", () => {
  render(<InputBase value="" placeholder="Name" onChange={() => {}} />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-inputbase");
});

test("controlled value/onChange", () => {
  const onChange = vi.fn();
  render(<InputBase value="hi" onChange={onChange} placeholder="Name" />);
  const el = screen.getByPlaceholderText("Name") as HTMLInputElement;
  expect(el.value).toBe("hi");
  fireEvent.change(el, { target: { value: "hi!" } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

test("leftIcon renders inside a left slot", () => {
  render(
    <InputBase
      value=""
      onChange={() => {}}
      placeholder="Name"
      leftIcon={<span data-testid="left-icon">search</span>}
    />
  );
  const icon = screen.getByTestId("left-icon");
  expect(icon.closest(".hx-inputbase__left")).not.toBeNull();
});

test("rightSlot renders inside a right slot", () => {
  render(
    <InputBase
      value=""
      onChange={() => {}}
      placeholder="Name"
      rightSlot={<button type="button">clear</button>}
    />
  );
  const btn = screen.getByRole("button", { name: "clear" });
  expect(btn.closest(".hx-inputbase__right")).not.toBeNull();
});

test("rightSlotWidthPx reserves right padding on the control via inline style", () => {
  render(
    <InputBase
      value=""
      onChange={() => {}}
      placeholder="Name"
      rightSlot={<button type="button">clear</button>}
      rightSlotWidthPx={62}
    />
  );
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveStyle({ paddingRight: "62px" });
});

test("rightSlotWidthPx defaults to 36px when a rightSlot is present", () => {
  render(
    <InputBase value="" onChange={() => {}} placeholder="Name" rightSlot={<span>x</span>} />
  );
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveStyle({ paddingRight: "36px" });
});

test("errorText renders an error node wired via aria-describedby + aria-invalid", () => {
  render(
    <InputBase
      value=""
      onChange={() => {}}
      placeholder="Name"
      errorText="Required"
      errorId="name-error"
    />
  );
  const input = screen.getByPlaceholderText("Name");
  const error = screen.getByText("Required");
  expect(error).toHaveAttribute("id", "name-error");
  expect(input).toHaveAttribute("aria-describedby", "name-error");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveClass("hx-inputbase--invalid");
});

test("errorText without an explicit errorId still wires aria-describedby to the rendered error node", () => {
  render(<InputBase value="" onChange={() => {}} placeholder="Name" errorText="Required" />);
  const input = screen.getByPlaceholderText("Name");
  const error = screen.getByText("Required");
  expect(error.id).toBeTruthy();
  expect(input).toHaveAttribute("aria-describedby", error.id);
});

test("hideErrorText suppresses the visible error node but keeps aria-invalid + aria-describedby", () => {
  render(
    <InputBase
      value=""
      onChange={() => {}}
      placeholder="Name"
      errorText="Required"
      errorId="name-error"
      hideErrorText
    />
  );
  const input = screen.getByPlaceholderText("Name");
  expect(screen.queryByText("Required")).not.toBeInTheDocument();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "name-error");
});

test("onFocusChange fires true on focus and false on blur", () => {
  const onFocusChange = vi.fn();
  render(
    <InputBase value="" onChange={() => {}} placeholder="Name" onFocusChange={onFocusChange} />
  );
  const input = screen.getByPlaceholderText("Name");
  fireEvent.focus(input);
  expect(onFocusChange).toHaveBeenNthCalledWith(1, true);
  fireEvent.blur(input);
  expect(onFocusChange).toHaveBeenNthCalledWith(2, false);
});

test("fullWidth adds the full-width modifier class to the wrapper", () => {
  render(<InputBase value="" onChange={() => {}} placeholder="Name" fullWidth />);
  const input = screen.getByPlaceholderText("Name");
  expect(input.closest(".hx-inputbase-wrap")).toHaveClass("hx-inputbase--full");
});

test("forwards native props (disabled, maxLength)", () => {
  render(<InputBase value="" onChange={() => {}} placeholder="Name" disabled maxLength={5} />);
  const input = screen.getByPlaceholderText("Name") as HTMLInputElement;
  expect(input).toBeDisabled();
  expect(input).toHaveAttribute("maxLength", "5");
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<InputBase value="" onChange={() => {}} placeholder="Name" ref={ref} />);
  expect(ref.current).toBe(screen.getByPlaceholderText("Name"));
});

test("preserves custom className alongside base class", () => {
  render(<InputBase value="" onChange={() => {}} placeholder="Name" className="custom" />);
  const el = screen.getByPlaceholderText("Name");
  expect(el).toHaveClass("hx-inputbase", "custom");
});

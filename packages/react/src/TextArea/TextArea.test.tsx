import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TextArea } from "./TextArea";

test("renders with base class", () => {
  render(<TextArea placeholder="Bio" />);
  const el = screen.getByPlaceholderText("Bio");
  expect(el.tagName).toBe("TEXTAREA");
  expect(el).toHaveClass("hx-textarea");
});

test("label renders an associated <label> for the textarea", () => {
  render(<TextArea label="Bio" placeholder="About you" />);
  const el = screen.getByPlaceholderText("About you");
  const label = screen.getByText("Bio");
  expect(label.tagName).toBe("LABEL");
  expect(label).toHaveAttribute("for", el.id);
});

test("textLimit maps to the native maxLength attribute", () => {
  render(<TextArea placeholder="Bio" textLimit={140} />);
  expect(screen.getByPlaceholderText("Bio")).toHaveAttribute("maxLength", "140");
});

test("textLimit renders a live count/limit counter", () => {
  render(<TextArea placeholder="Bio" textLimit={140} value="hello" onChange={() => {}} />);
  expect(screen.getByText("5/140")).toBeInTheDocument();
});

test("errorText renders an error node wired via aria-describedby + aria-invalid", () => {
  render(<TextArea placeholder="Bio" errorText="Too long" />);
  const el = screen.getByPlaceholderText("Bio");
  const error = screen.getByText("Too long");
  expect(error.id).toBeTruthy();
  expect(el).toHaveAttribute("aria-describedby", error.id);
  expect(el).toHaveAttribute("aria-invalid", "true");
  expect(el).toHaveClass("hx-textarea--invalid");
});

test("allowClear shows a clear button when there is a value, and clicking it clears via onChange", () => {
  let receivedValue: string | undefined;
  const onChange = vi.fn((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    receivedValue = event.target.value;
  });
  render(<TextArea placeholder="Bio" value="hello" allowClear onChange={onChange} />);
  const clearBtn = screen.getByRole("button", { name: /clear/i });
  fireEvent.click(clearBtn);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(receivedValue).toBe("");
});

test("allowClear renders no clear button when there is no value", () => {
  render(<TextArea placeholder="Bio" value="" allowClear onChange={() => {}} />);
  expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
});

test("allowClear is hidden while disabled, even with a value", () => {
  render(<TextArea placeholder="Bio" value="hello" allowClear disabled onChange={() => {}} />);
  expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
});

test("autoSize sizes on initial mount from the node's scrollHeight", () => {
  render(
    <TextArea
      autoSize
      placeholder="Bio"
      defaultValue={"line1\nline2\nline3"}
      ref={(node) => {
        if (node) Object.defineProperty(node, "scrollHeight", { configurable: true, value: 90 });
      }}
    />
  );
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  expect(el.style.height).toBe("90px");
});

test("autoSize grows the textarea height as content grows (driven by scrollHeight)", () => {
  render(<TextArea autoSize placeholder="Bio" value="" onChange={() => {}} />);
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 120 });
  fireEvent.change(el, { target: { value: "line1\nline2\nline3\nline4" } });
  expect(el.style.height).toBe("120px");
});

test("autoSize caps growth at maxRows", () => {
  render(<TextArea autoSize maxRows={2} placeholder="Bio" value="" onChange={() => {}} />);
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 500 });
  fireEvent.change(el, { target: { value: "lots of lines".repeat(50) } });
  // jsdom's getComputedStyle returns a non-numeric lineHeight ("normal") absent
  // a real stylesheet, so the component falls back to a documented 20px/row.
  expect(el.style.height).toBe("40px");
});

test("autoSize recomputes when a controlled `value` changes externally (not via this textarea's onChange)", () => {
  const { rerender } = render(<TextArea autoSize placeholder="Bio" value="line1" onChange={() => {}} />);
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 150 });
  // Re-render with a longer controlled value via `rerender`, simulating a
  // consumer loading a draft / resetting the form -- NOT a `fireEvent.change`
  // on the textarea itself, so `handleChange` never runs.
  rerender(<TextArea autoSize placeholder="Bio" value={"line1\nline2\nline3"} onChange={() => {}} />);
  expect(el.style.height).toBe("150px");
});

test("without autoSize, no inline height is ever set", () => {
  render(<TextArea placeholder="Bio" value="" onChange={() => {}} />);
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  fireEvent.change(el, { target: { value: "line1\nline2" } });
  expect(el.style.height).toBe("");
});

test("forwards native props (disabled, rows)", () => {
  render(<TextArea placeholder="Bio" disabled rows={6} />);
  const el = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
  expect(el).toBeDisabled();
  expect(el).toHaveAttribute("rows", "6");
});

test("forwards ref to the underlying textarea element", () => {
  const ref = React.createRef<HTMLTextAreaElement>();
  render(<TextArea placeholder="Bio" ref={ref} />);
  expect(ref.current).toBe(screen.getByPlaceholderText("Bio"));
});

test("preserves custom className alongside base class", () => {
  render(<TextArea placeholder="Bio" className="custom" />);
  expect(screen.getByPlaceholderText("Bio")).toHaveClass("hx-textarea", "custom");
});

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Link } from "./Link";

test("renders an <a> with the given href", () => {
  render(<Link href="https://example.com">Go</Link>);
  const el = screen.getByRole("link", { name: "Go" });
  expect(el.tagName).toBe("A");
  expect(el).toHaveAttribute("href", "https://example.com");
});

test("defaults to variant font-body-regular and color color-text-accent", () => {
  render(<Link href="/x">Go</Link>);
  const el = screen.getByRole("link", { name: "Go" });
  expect(el).toHaveClass("hx-text--font-body-regular", "hx-text--color-text-accent");
});

test("variant/color props override the defaults", () => {
  render(
    <Link href="/x" variant="font-H1" color="color-text-error">
      Go
    </Link>
  );
  const el = screen.getByRole("link", { name: "Go" });
  expect(el).toHaveClass("hx-text--font-H1", "hx-text--color-text-error");
});

test("ellipsis applies the shared hx-text--ellipsis class", () => {
  render(
    <Link href="/x" ellipsis>
      Go
    </Link>
  );
  expect(screen.getByRole("link", { name: "Go" })).toHaveClass("hx-text--ellipsis");
});

test("external adds rel=noopener noreferrer and target=_blank", () => {
  render(
    <Link href="https://example.com" external>
      Out
    </Link>
  );
  const el = screen.getByRole("link", { name: "Out" });
  expect(el).toHaveAttribute("target", "_blank");
  expect(el).toHaveAttribute("rel", "noopener noreferrer");
});

test("target=_blank without external also adds the safe rel", () => {
  render(
    <Link href="https://example.com" target="_blank">
      Out
    </Link>
  );
  expect(screen.getByRole("link", { name: "Out" })).toHaveAttribute("rel", "noopener noreferrer");
});

test("an explicit rel wins over the automatic noopener noreferrer", () => {
  render(
    <Link href="https://example.com" external rel="nofollow">
      Out
    </Link>
  );
  expect(screen.getByRole("link", { name: "Out" })).toHaveAttribute("rel", "nofollow");
});

test("same-tab links (no external, no _blank) get no rel", () => {
  render(<Link href="/local">In</Link>);
  expect(screen.getByRole("link", { name: "In" })).not.toHaveAttribute("rel");
});

test("onClick fires for an enabled link", async () => {
  const onClick = vi.fn();
  render(
    <Link href="/x" onClick={onClick}>
      Go
    </Link>
  );
  screen.getByRole("link", { name: "Go" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled removes href/target/rel and interactivity, and never calls onClick", () => {
  const onClick = vi.fn();
  render(
    <Link href="https://example.com" external onClick={onClick} disabled>
      Go
    </Link>
  );
  const el = screen.getByRole("link", { name: "Go" });
  expect(el).not.toHaveAttribute("href");
  expect(el).not.toHaveAttribute("target");
  expect(el).not.toHaveAttribute("rel");
  expect(el).toHaveAttribute("aria-disabled", "true");
  expect(el).toHaveAttribute("tabindex", "-1");
  expect(el).toHaveClass("hx-link--disabled");
  el.click();
  expect(onClick).not.toHaveBeenCalled();
});

test("disabled forces the subtle text color even if a color prop is given", () => {
  render(
    <Link href="/x" color="color-text-error" disabled>
      Go
    </Link>
  );
  expect(screen.getByRole("link", { name: "Go" })).toHaveClass("hx-text--color-text-subtle");
});

test("dataID sets the data-id attribute", () => {
  render(
    <Link href="/x" dataID="my-link">
      Go
    </Link>
  );
  expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("data-id", "my-link");
});

test("ariaLabel sets the accessible name", () => {
  render(
    <Link href="/x" ariaLabel="Open settings">
      icon-only
    </Link>
  );
  expect(screen.getByRole("link", { name: "Open settings" })).toBeInTheDocument();
});

test("preserves a custom className alongside the generated classes", () => {
  render(
    <Link href="/x" className="custom">
      Go
    </Link>
  );
  expect(screen.getByRole("link", { name: "Go" })).toHaveClass("hx-link", "custom");
});

test("forwards ref to the underlying <a> element", () => {
  const ref = React.createRef<HTMLAnchorElement>();
  render(
    <Link href="/x" ref={ref}>
      Go
    </Link>
  );
  expect(ref.current).toBe(screen.getByRole("link", { name: "Go" }));
});

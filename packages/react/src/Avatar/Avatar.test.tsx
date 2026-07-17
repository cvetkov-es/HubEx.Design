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

// --- Real 9-colour palette (Task 4) ---
//
// Avatar picks one of the 9 real Figma colour sets (Figma: colors/avatar)
// deterministically from `name`, via a char-sum hash: sum `name`'s char
// codes, mod 9, index into ["one","two","three","four","five","six","seven",
// "eight","nine"]. The component adds a single `hx-avatar--<word>` class;
// index.css supplies the actual background/border/text from that set's
// tokens.

const AVATAR_SET_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

function colorSetClassOf(el: Element): string | undefined {
  return AVATAR_SET_WORDS.map((w) => `hx-avatar--${w}`).find((c) => el.classList.contains(c));
}

test("renders one of the nine avatar colour-set classes for a given name", () => {
  const { container } = render(<Avatar name="Alex Petrov" />);
  const el = container.querySelector(".hx-avatar")!;
  expect(colorSetClassOf(el)).toBeDefined();
});

test("the same name always picks the same colour-set class", () => {
  const { container: first } = render(<Avatar name="Alex Petrov" />);
  const { container: second } = render(<Avatar name="Alex Petrov" />);
  const firstClass = colorSetClassOf(first.querySelector(".hx-avatar")!);
  const secondClass = colorSetClassOf(second.querySelector(".hx-avatar")!);
  expect(firstClass).toBeDefined();
  expect(secondClass).toBe(firstClass);
});

// Hand-verified char-sum hash for single-letter names (the sum is just that
// one character's own UTF-16 code, so `% 9` can be checked by hand without a
// calculator):
//   "A" = 65, 65 % 9 = 2 -> AVATAR_SET_WORDS[2] = "three"
//   "B" = 66, 66 % 9 = 3 -> "four"
//   "C" = 67, 67 % 9 = 4 -> "five"
//   "D" = 68, 68 % 9 = 5 -> "six"
//   "E" = 69, 69 % 9 = 6 -> "seven"
//   "F" = 70, 70 % 9 = 7 -> "eight"
//   "G" = 71, 71 % 9 = 8 -> "nine"
//   "H" = 72, 72 % 9 = 0 -> "one"
//   "I" = 73, 73 % 9 = 1 -> "two"
// These 9 deliberately chosen names cover all nine sets exactly once, so this
// proves the hash actually spreads different names across different sets
// rather than merely differing between two arbitrary names.
test("different names spread deterministically across all nine colour sets", () => {
  const expected: Record<string, string> = {
    A: "hx-avatar--three",
    B: "hx-avatar--four",
    C: "hx-avatar--five",
    D: "hx-avatar--six",
    E: "hx-avatar--seven",
    F: "hx-avatar--eight",
    G: "hx-avatar--nine",
    H: "hx-avatar--one",
    I: "hx-avatar--two",
  };
  const seen = new Set<string>();
  for (const [name, expectedClass] of Object.entries(expected)) {
    const { container } = render(<Avatar name={name} />);
    const el = container.querySelector(".hx-avatar")!;
    expect(el).toHaveClass(expectedClass);
    seen.add(expectedClass);
  }
  expect(seen.size).toBe(9); // all nine sets actually got hit, not a subset
});

test("applies the colour-set class even when an image src is given", () => {
  const { container } = render(<Avatar name="H" src="https://example.com/a.png" />);
  const el = container.querySelector(".hx-avatar")!;
  expect(el).toHaveClass("hx-avatar--one"); // "H" -> one, verified above
});

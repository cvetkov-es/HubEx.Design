import { render, screen } from "@testing-library/react";
import * as React from "react";
import { AvatarGroup } from "./AvatarGroup";

const AVATARS = [
  { id: "1", name: "Alex Petrov" },
  { id: "2", name: "Cher" },
  { id: "3", name: "Dana Lee" },
  { id: "4", name: "Evan Wu" },
  { id: "5", name: "Fay Kim" },
];

test("renders one Avatar-like element per item when under maxVisible", () => {
  const { container } = render(<AvatarGroup avatars={AVATARS.slice(0, 2)} />);
  expect(container.querySelectorAll(".hx-avatar-group__avatar").length).toBe(2);
  expect(screen.queryByText("+")).not.toBeInTheDocument();
});

test("truncates at the default maxVisible (3) and shows a +N overflow chip", () => {
  render(<AvatarGroup avatars={AVATARS} />);
  // 3 real avatars + 1 overflow chip = 4 elements, overflow reads "+2" (5 - 3)
  expect(screen.getByText("+2")).toBeInTheDocument();
});

test("truncates at a custom maxVisible", () => {
  render(<AvatarGroup avatars={AVATARS} maxVisible={2} />);
  expect(screen.getByText("+3")).toBeInTheDocument();
});

test("shows no overflow chip when avatars.length <= maxVisible", () => {
  render(<AvatarGroup avatars={AVATARS.slice(0, 3)} maxVisible={3} />);
  expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
});

test("renders visible avatars with their initials", () => {
  render(<AvatarGroup avatars={AVATARS.slice(0, 2)} />);
  expect(screen.getByText("AP")).toBeInTheDocument();
  expect(screen.getByText("C")).toBeInTheDocument();
});

test.each(["l", "m", "s"] as const)("size=%s applies the matching group-size class", (size) => {
  const { container } = render(<AvatarGroup avatars={AVATARS.slice(0, 1)} size={size} />);
  expect(container.querySelector(".hx-avatar-group__avatar")).toHaveClass(
    `hx-avatar-group__avatar--${size}`
  );
});

test("defaults to size l", () => {
  const { container } = render(<AvatarGroup avatars={AVATARS.slice(0, 1)} />);
  expect(container.querySelector(".hx-avatar-group__avatar")).toHaveClass(
    "hx-avatar-group__avatar--l"
  );
});

test("sets aria-label on the group wrapper when provided", () => {
  render(<AvatarGroup avatars={AVATARS.slice(0, 1)} ariaLabel="Team members" />);
  expect(screen.getByLabelText("Team members")).toBeInTheDocument();
});

test("forwards ref to the underlying wrapper element", () => {
  const ref = React.createRef<HTMLDivElement>();
  render(<AvatarGroup ref={ref} avatars={AVATARS.slice(0, 1)} data-testid="group-el" />);
  expect(ref.current).toBe(screen.getByTestId("group-el"));
});

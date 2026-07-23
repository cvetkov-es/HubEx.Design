// Shared types for the Badge family (Badge, BadgeDot, BadgeCount, BadgeTag, BadgeShift).
// This file exports ONLY types/plain constants (no components, no JSX) so it never
// becomes its own tsup entry chunk and carries no risk to per-component tree-shaking
// (see Badge.tsx for why displayName is set via Object.assign instead of a bare
// assignment — the same tree-shaking concern doesn't apply here since nothing in this
// file is a value with side effects).

// Official DS: `keyof typeof tokens.HubEx.colors.background` (Badge.types.d.ts). Our
// own token set normalizes the upstream "backgroundg" typo (see CHANGELOG 0.2.0), so
// these suffixes map 1:1 onto `--hx-color-background-<suffix>` CSS variables.
export type BadgeBackgroundToken =
  | "primary"
  | "secondary"
  | "tertiary"
  | "strong"
  | "neutral"
  | "subtle"
  | "weak"
  | "page"
  | "hoverlist"
  | "inverse"
  | "accent"
  | "accent-hover"
  | "highlight"
  | "success"
  | "warning"
  | "error";

export type BadgeTagType = "new" | "beta";
export type BadgeTagTone = "light" | "dark";
export type BadgeShiftStatus = "online" | "offline";
export type BadgeShiftSize = "xl" | "l" | "m" | "s";

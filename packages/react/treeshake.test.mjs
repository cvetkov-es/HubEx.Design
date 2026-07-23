import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

async function bundleSize(entryContents) {
  const r = await build({
    stdin: { contents: entryContents, resolveDir: process.cwd(), loader: "js" },
    bundle: true, format: "esm", minify: true, write: false,
    external: ["react", "react-dom", "react/jsx-runtime"],
    absWorkingDir: process.cwd()
  });
  return r.outputFiles[0].text;
}

test("importing only Button yields a tiny, react-free bundle", async () => {
  const out = await bundleSize(`import { Button } from "./dist/index.js"; console.log(Button);`);
  const bytes = Buffer.byteLength(out, "utf8");
  assert.ok(bytes < 8000, `Button-only bundle too large: ${bytes} bytes (expected < 8000)`);
  assert.ok(!/react-dom/.test(out), "react-dom must be external, not bundled");
  assert.ok(
    !out.includes("hx-toggle"),
    "Button-only bundle must not pull in other components (Toggle's hx-toggle class found)"
  );
  assert.ok(
    !out.includes("hx-select"),
    "Button-only bundle must not pull in other components (Select's hx-select class found)"
  );
  assert.ok(
    !out.includes("hx-table"),
    "Button-only bundle must not pull in other components (Table's hx-table class found)"
  );
  assert.ok(
    !out.includes("hx-pagination"),
    "Button-only bundle must not pull in other components (Pagination's hx-pagination class found)"
  );
  assert.ok(
    !out.includes("hx-modal"),
    "Button-only bundle must not pull in other components (Modal's hx-modal class found)"
  );
  assert.ok(
    !out.includes("hx-drawer"),
    "Button-only bundle must not pull in other components (Drawer's hx-drawer class found)"
  );
  assert.ok(
    !out.includes("hx-tooltip"),
    "Button-only bundle must not pull in other components (Tooltip's hx-tooltip class found)"
  );
  assert.ok(
    !out.includes("hx-tabs"),
    "Button-only bundle must not pull in other components (Tabs's hx-tabs class found)"
  );
  assert.ok(
    !out.includes("hx-menu"),
    "Button-only bundle must not pull in other components (Menu's hx-menu class found)"
  );
  assert.ok(
    !out.includes("hx-breadcrumbs"),
    "Button-only bundle must not pull in other components (Breadcrumbs's hx-breadcrumbs class found)"
  );
  assert.ok(
    !out.includes("hx-tag"),
    "Button-only bundle must not pull in other components (Tag's hx-tag class found)"
  );
  assert.ok(
    !out.includes("hx-chip"),
    "Button-only bundle must not pull in other components (Chip's hx-chip class found)"
  );
  assert.ok(
    !out.includes("hx-badge"),
    "Button-only bundle must not pull in other components (Badge's hx-badge class found)"
  );
  assert.ok(
    !out.includes("hx-avatar"),
    "Button-only bundle must not pull in other components (Avatar's hx-avatar class found)"
  );
  assert.ok(
    !out.includes("hx-alert"),
    "Button-only bundle must not pull in other components (Alert's hx-alert class found)"
  );
  assert.ok(
    !out.includes("hx-icon"),
    "Button-only bundle must not pull in other components (Icon's hx-icon class found)"
  );
  assert.ok(
    !out.includes("hx-calendar"),
    "Button-only bundle must not pull in other components (Calendar's hx-calendar class found)"
  );
  assert.ok(
    !out.includes("hx-datepicker"),
    "Button-only bundle must not pull in other components (DatePicker's hx-datepicker class found)"
  );
});

// Task 7 regression guard: the Badge family was split into five independent
// exports (Badge, BadgeDot, BadgeCount, BadgeTag, BadgeShift) plus Pagination
// and the AvatarGroup rewrite. Importing just one Badge-family export must not
// drag in unrelated components' literal class strings (proving per-export
// tree-shaking, not just per-package).
test("importing only BadgeDot yields a bundle free of unrelated components' classes", async () => {
  const out = await bundleSize(`import { BadgeDot } from "./dist/index.js"; console.log(BadgeDot);`);
  const bytes = Buffer.byteLength(out, "utf8");
  assert.ok(bytes < 8000, `BadgeDot-only bundle too large: ${bytes} bytes (expected < 8000)`);
  assert.ok(!/react-dom/.test(out), "react-dom must be external, not bundled");
  assert.ok(
    !out.includes("hx-avatar"),
    "BadgeDot-only bundle must not pull in other components (Avatar's hx-avatar class found)"
  );
  assert.ok(
    !out.includes("hx-avatar-group"),
    "BadgeDot-only bundle must not pull in other components (AvatarGroup's hx-avatar-group class found)"
  );
  assert.ok(
    !out.includes("hx-pagination"),
    "BadgeDot-only bundle must not pull in other components (Pagination's hx-pagination class found)"
  );
  assert.ok(
    !out.includes("hx-select"),
    "BadgeDot-only bundle must not pull in other components (Select's hx-select class found)"
  );
  assert.ok(
    !out.includes("hx-btn"),
    "BadgeDot-only bundle must not pull in other components (Button's hx-btn class found)"
  );
  assert.ok(
    !out.includes("hx-badge-tag"),
    "BadgeDot-only bundle must not pull in sibling Badge-family components (BadgeTag's hx-badge-tag class found)"
  );
  assert.ok(
    !out.includes("hx-badge-count"),
    "BadgeDot-only bundle must not pull in sibling Badge-family components (BadgeCount's hx-badge-count class found)"
  );
  assert.ok(
    !out.includes("hx-badge-shift"),
    "BadgeDot-only bundle must not pull in sibling Badge-family components (BadgeShift's hx-badge-shift class found)"
  );
  assert.ok(
    out.includes("hx-badge-dot"),
    "BadgeDot-only bundle must include its own hx-badge-dot literal class"
  );
});

// Task 8: Text/Link/Loader are brand-new components (not previously exported
// at all). Importing just Text must not drag in any pre-existing component's
// literal class strings — proving the new per-component entry (src/Text/Text.tsx,
// added to the tsup `entry` glob via src/*/*.tsx) is tree-shaken exactly like
// every sibling component.
test("importing only Text yields a bundle free of unrelated components' classes", async () => {
  const out = await bundleSize(`import { Text } from "./dist/index.js"; console.log(Text);`);
  const bytes = Buffer.byteLength(out, "utf8");
  assert.ok(bytes < 8000, `Text-only bundle too large: ${bytes} bytes (expected < 8000)`);
  assert.ok(!/react-dom/.test(out), "react-dom must be external, not bundled");
  assert.ok(
    !out.includes("hx-avatar"),
    "Text-only bundle must not pull in other components (Avatar's hx-avatar class found)"
  );
  assert.ok(
    !out.includes("hx-pagination"),
    "Text-only bundle must not pull in other components (Pagination's hx-pagination class found)"
  );
  assert.ok(
    !out.includes("hx-select"),
    "Text-only bundle must not pull in other components (Select's hx-select class found)"
  );
  assert.ok(
    !out.includes("hx-btn"),
    "Text-only bundle must not pull in other components (Button's hx-btn class found)"
  );
  assert.ok(
    !out.includes("hx-badge"),
    "Text-only bundle must not pull in other components (Badge's hx-badge class found)"
  );
  assert.ok(
    out.includes("hx-text"),
    "Text-only bundle must include its own hx-text literal class"
  );
});

test("importing only Link yields a bundle free of unrelated components' classes", async () => {
  const out = await bundleSize(`import { Link } from "./dist/index.js"; console.log(Link);`);
  const bytes = Buffer.byteLength(out, "utf8");
  assert.ok(bytes < 8000, `Link-only bundle too large: ${bytes} bytes (expected < 8000)`);
  assert.ok(!/react-dom/.test(out), "react-dom must be external, not bundled");
  assert.ok(
    !out.includes("hx-avatar"),
    "Link-only bundle must not pull in other components (Avatar's hx-avatar class found)"
  );
  assert.ok(
    !out.includes("hx-pagination"),
    "Link-only bundle must not pull in other components (Pagination's hx-pagination class found)"
  );
  assert.ok(
    !out.includes("hx-select"),
    "Link-only bundle must not pull in other components (Select's hx-select class found)"
  );
  assert.ok(
    !out.includes("hx-btn"),
    "Link-only bundle must not pull in other components (Button's hx-btn class found)"
  );
  assert.ok(
    out.includes("hx-link"),
    "Link-only bundle must include its own hx-link literal class"
  );
});

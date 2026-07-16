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

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
});

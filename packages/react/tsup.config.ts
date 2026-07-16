import { defineConfig } from "tsup";
export default defineConfig({
  // Every component .tsx is its own entry (not just src/index.ts) so esbuild
  // emits one chunk per component with dist/index.js as a thin barrel of
  // `export { X } from './chunk-*.js'` re-exports, instead of one monolithic
  // dist/index.js. This matters once a component imports an external runtime
  // dep that isn't used by every component (react-dom's createPortal, used by
  // Modal/Drawer/Menu): react-dom has no "sideEffects": false of its own, so
  // when everything lives in a single bundled file, downstream tree-shakers
  // can't prove an unused `import { createPortal } from "react-dom"` is safe
  // to drop and conservatively keep it — even in a Button-only bundle. With
  // one file per component, a consumer that never imports Modal/Drawer/Menu
  // never pulls in their chunk file at all (whole-file, reachability-based
  // exclusion via this package's own "sideEffects": false), so the stray
  // react-dom import never appears. Verified by treeshake.test.mjs.
  entry: ["src/index.ts", "src/*/*.tsx", "!src/*/*.test.tsx"],
  format: ["esm"],          // ESM-only — no CJS build (avoids default-interop crashes)
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,          // code-split ESM so unused components drop
  external: ["react", "react-dom"],
  injectStyle: false        // never inline CSS into the JS
});

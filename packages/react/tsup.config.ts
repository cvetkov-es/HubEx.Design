import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],          // ESM-only — no CJS build (avoids default-interop crashes)
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,          // code-split ESM so unused components drop
  external: ["react", "react-dom"],
  injectStyle: false        // never inline CSS into the JS
});

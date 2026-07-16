import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // treeshake.test.mjs is a plain node:test file run separately via
    // `node --test`, not a Vitest suite — exclude it here.
    exclude: ["node_modules/**", "dist/**", "treeshake.test.mjs"]
  }
});

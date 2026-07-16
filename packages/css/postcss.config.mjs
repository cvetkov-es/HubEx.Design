import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssImport from "postcss-import";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Custom resolver to handle package exports
function resolvePackageExport(id, basedir, importOptions) {
  // Handle @hubex/tokens/css -> node_modules/@hubex/tokens/dist/variables.css
  if (id === "@hubex/tokens/css") {
    return join(__dirname, "node_modules", "@hubex", "tokens", "dist", "variables.css");
  }
  // Return original id for other imports (postcss-import will handle them)
  return id;
}

export default {
  plugins: [
    postcssImport({
      root: __dirname,
      path: [__dirname, join(__dirname, "node_modules")],
      resolve: resolvePackageExport
    }),
    autoprefixer(),
    cssnano({ preset: "default" })
  ]
};

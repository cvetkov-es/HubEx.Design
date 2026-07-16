import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssImport from "postcss-import";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve the tokens CSS via package-exports resolution so it works
// regardless of node_modules hoisting (e.g. pnpm's symlinked layout).
function resolveTokensCssPath() {
  try {
    // Honors the "./css" export of @hubex/tokens -> dist/variables.css
    return require.resolve("@hubex/tokens/css");
  } catch {
    // Fallback for older/incomplete exports resolution: locate the
    // package root via its package.json and join the known dist path.
    const pkgJsonPath = require.resolve("@hubex/tokens/package.json");
    return join(dirname(pkgJsonPath), "dist", "variables.css");
  }
}

const tokensCssPath = resolveTokensCssPath();

// Custom resolver to handle package exports
function resolvePackageExport(id, basedir, importOptions) {
  // Handle @hubex/tokens/css -> resolved dist/variables.css path
  if (id === "@hubex/tokens/css") {
    return tokensCssPath;
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

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function tally(regex, text, normalize = (s) => s) {
  const out = {};
  for (const m of text.matchAll(regex)) {
    const key = normalize(m[1]);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

export function harvest(cssText) {
  return {
    colors: tally(/(#[0-9a-fA-F]{6})\b/g, cssText, (s) => s.toUpperCase()),
    fontSizes: tally(/font-size:\s*([0-9.]+px)/g, cssText),
    fontFamilies: tally(/font-family:\s*'([^']+)'/g, cssText),
    radii: tally(/border-radius:\s*([0-9.]+px)/g, cssText),
  };
}

function merge(into, from) {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] || 0) + v;
}

function sortByCount(obj) {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]));
}

function main() {
  const [dir, outFile] = process.argv.slice(2);
  if (!dir || !outFile) {
    console.error("usage: node tools/harvest.mjs <sourceDir> <outFile>");
    process.exit(1);
  }
  const agg = { colors: {}, fontSizes: {}, fontFamilies: {}, radii: {} };
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".css"))) {
    const r = harvest(readFileSync(join(dir, f), "utf8"));
    for (const key of Object.keys(agg)) merge(agg[key], r[key]);
  }
  for (const key of Object.keys(agg)) agg[key] = sortByCount(agg[key]);
  writeFileSync(outFile, JSON.stringify(agg, null, 2));
  console.log(`wrote ${outFile}: ${Object.keys(agg.colors).length} colors, ` +
    `${Object.keys(agg.fontSizes).length} font sizes`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export default {
  source: ["src/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "hx",
      buildPath: "dist/",
      files: [{ destination: "variables.css", format: "css/variables" }]
    },
    js: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.json", format: "json/nested" }
      ]
    }
  }
};

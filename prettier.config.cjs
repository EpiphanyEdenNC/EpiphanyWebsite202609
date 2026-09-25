// prettier.config.cjs
/** @type {import("prettier").Config} */
module.exports = {
  // Use 2 spaces for indentation (common for JS/Astro/Tina)
  tabWidth: 2,
  useTabs: false,

  // Semicolons at end of statements
  semi: true,

  // Single quotes in JS/TS/JSX
  singleQuote: true,

  // Trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: "es5",

  // Keep JSX > on its own line
  bracketSameLine: false,

  // Files to include/ignore for formatting
  overrides: [
    {
      files: ["*.astro"],
      options: {
        // Astro templates also use 2-space indentation
        tabWidth: 2,
      },
    },
  ],
};

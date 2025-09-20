import js from "@eslint/js";
import globals from "globals";

export default [
  // Base JS rules
  js.configs.recommended,

  // Node globals for everything
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },

  // Jest globals for tests
  {
    files: [
      "**/*.test.{js,mjs,cjs}",
      "**/*.spec.{js,mjs,cjs}",
      "tests/**/*.{js,mjs,cjs}",
      "__tests__/**/*.{js,mjs,cjs}",
    ],
    languageOptions: { globals: { ...globals.jest } },
  },
];

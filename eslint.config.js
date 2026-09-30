import globals from "globals";
export default [
  {
    files: ["script.js", "scripts/*.mjs", "tests/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-constant-condition": "error",
      eqeqeq: "error",
    },
  },
];

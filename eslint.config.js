import eslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    ignores: ["examples"],
    plugins: {
      "@typescript-eslint": eslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./tsconfig.test.json"],
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
];

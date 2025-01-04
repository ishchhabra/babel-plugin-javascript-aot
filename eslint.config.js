import eslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    ignores: ["dist/**"],
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

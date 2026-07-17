import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import importX from "eslint-plugin-import-x"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import unicorn from "eslint-plugin-unicorn"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    plugins: {
      unicorn,
      "import-x": importX,
    },
    rules: {
      // Conventions (see AGENTS.md):
      // 1. File names must be kebab-case.
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      // 3. No type casting, except `as const` (exempted by this rule).
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      // 6. Prefer named exports over default exports.
      "import-x/no-default-export": "error",
    },
  },
  {
    // Tooling config files conventionally require a default export
    // (eslint.config.js, next.config.ts, postcss.config.mjs, wxt.config.ts, ...).
    files: ["**/*.config.{js,mjs,cjs,ts,mts,cts}", "eslint.config.js"],
    rules: {
      "import-x/no-default-export": "off",
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]

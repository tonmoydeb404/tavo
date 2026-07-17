import js from "@eslint/js"
import pluginNext from "@next/eslint-plugin-next"
import eslintConfigPrettier from "eslint-config-prettier"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

import { config as baseConfig } from "./base.js"

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    // Next.js special files are framework-mandated to use a default export.
    files: [
      "**/page.tsx",
      "**/page.ts",
      "**/layout.tsx",
      "**/layout.ts",
      "**/loading.tsx",
      "**/error.tsx",
      "**/not-found.tsx",
      "**/template.tsx",
      "**/route.ts",
      "**/global-error.tsx",
      "**/default.tsx",
      "**/middleware.ts",
      "**/instrumentation.ts",
      "**/opengraph-image.tsx",
      "**/opengraph-image.ts",
      "**/twitter-image.tsx",
      "**/twitter-image.ts",
      "**/icon.tsx",
      "**/icon.ts",
      "**/apple-icon.tsx",
      "**/apple-icon.ts",
      "**/sitemap.ts",
      "**/robots.ts",
    ],
    rules: {
      "import-x/no-default-export": "off",
    },
  },
]

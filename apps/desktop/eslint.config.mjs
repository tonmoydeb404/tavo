import { config as reactInternalConfig } from "@workspace/eslint-config/react-internal"

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "src-tauri/**"],
  },
  ...reactInternalConfig,
]

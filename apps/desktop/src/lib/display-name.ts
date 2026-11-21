import { brand } from "./brand"

// Runtime app name with an environment postfix: "Tavo Dev" in dev builds
// (`vite dev` / debug Rust), "Tavo" in production. Brand values themselves
// live in brand.json (generated `brand.ts` untouched) — this composes the
// display name only, mirroring src-tauri/src/env.rs on the Rust side.
// `import.meta.env.DEV` is a Vite compile-time constant (replaced at build,
// dead-code eliminated in production), not a runtime env var — the turbo
// rule can't tell the two apart.
// eslint-disable-next-line turbo/no-undeclared-env-vars
export const displayName: string = import.meta.env.DEV
  ? `${brand.appName} Dev`
  : brand.appName

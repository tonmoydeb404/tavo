#!/usr/bin/env node

import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = resolve(process.cwd())
// The root package.json is the source of truth for the version. These files
// get the same version; the desktop app (brand.json, tauri.conf.json,
// Cargo.toml, ...) is synced afterwards by `pnpm sync-brand`.
const TARGETS = [
  "package.json",
  "brand.json",
  "apps/web/package.json",
  "apps/extension/package.json",
]

function run(cmd, options = {}) {
  const output = execSync(cmd, {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })

  if (output == null) {
    return ""
  }

  return output.toString().trim()
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`)
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

function nextVersion(current, bump) {
  const v = parseVersion(current)

  if (bump === "major") {
    return `${v.major + 1}.0.0`
  }

  if (bump === "minor") {
    return `${v.major}.${v.minor + 1}.0`
  }

  if (bump === "patch") {
    return `${v.major}.${v.minor}.${v.patch + 1}`
  }

  parseVersion(bump)
  return bump
}

function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(ROOT, filePath), "utf8"))
}

function writeJson(filePath, data) {
  const fullPath = resolve(ROOT, filePath)
  writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function usage() {
  console.log(
    `\nUsage:\n  pnpm release:tag <major|minor|patch|x.y.z> [--dry-run] [--no-push]\n\nExamples:\n  pnpm release:tag patch\n  pnpm release:tag 2.1.0\n  pnpm release:tag minor --dry-run\n`
  )
}

async function findChangelogEntry(version) {
  const { findRelease } = await import(
    pathToFileURL(resolve(ROOT, "scripts/compose-release-notes.mjs")).href
  )
  return findRelease(version)
}

async function main() {
  const args = process.argv.slice(2)
  const bumpOrVersion = args[0]
  const dryRun = args.includes("--dry-run")
  const noPush = args.includes("--no-push")

  if (!bumpOrVersion || bumpOrVersion.startsWith("-")) {
    usage()
    process.exit(1)
  }

  for (const filePath of TARGETS) {
    if (!existsSync(resolve(ROOT, filePath))) {
      throw new Error(`Missing target file: ${filePath}`)
    }
  }

  const rootPkg = readJson("package.json")
  const currentVersion = rootPkg.version
  const newVersion = nextVersion(currentVersion, bumpOrVersion)
  const tag = `v${newVersion}`

  if (newVersion === currentVersion) {
    throw new Error(`Version is unchanged (${newVersion}).`)
  }

  if (dryRun) {
    console.log(
      `Dry run complete. Would set version ${currentVersion} -> ${newVersion} in:`
    )
    for (const filePath of TARGETS) {
      console.log(`- ${filePath}`)
    }
    console.log(`Would also sync apps/desktop via pnpm sync-brand`)
    console.log(`Would create tag: ${tag}`)
    console.log(
      (await findChangelogEntry(newVersion))
        ? "Changelog entry found."
        : `WARNING: no changelog entry for ${newVersion} in apps/web/src/content/changelog.ts — a real run would abort.`
    )
    return
  }

  // Release notes (GitHub release + updater dialog) come from this entry.
  if (!(await findChangelogEntry(newVersion))) {
    throw new Error(
      `No changelog entry for ${newVersion} in apps/web/src/content/changelog.ts.\nAdd one first — CI uses it for the release notes.`
    )
  }

  // Keep release commits predictable and avoid tagging unreviewed work.
  const status = run("git status --porcelain")
  if (status) {
    throw new Error(
      "Git working tree is not clean. Commit or stash changes first."
    )
  }

  const existingTag = run(`git tag -l ${tag}`)
  if (existingTag === tag) {
    throw new Error(`Tag already exists: ${tag}`)
  }

  for (const filePath of TARGETS) {
    const pkg = readJson(filePath)
    pkg.version = newVersion
    writeJson(filePath, pkg)
  }

  run("pnpm sync-brand", { stdio: "inherit" })

  run("git add -A")
  run(`git commit -m "chore(release): ${tag}"`, { stdio: "inherit" })
  run(`git tag -a ${tag} -m "Release ${tag}"`)

  if (!noPush) {
    run("git push", { stdio: "inherit" })
    run("git push --tags", { stdio: "inherit" })
  }

  console.log(
    `Released ${tag} (root, web, extension, brand.json + desktop via sync-brand).`
  )
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

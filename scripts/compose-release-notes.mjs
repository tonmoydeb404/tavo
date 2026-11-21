#!/usr/bin/env node

/**
 * Composes release notes from the changelog page content
 * (apps/web/src/content/changelog.ts), so the /changelog page, the GitHub
 * release body and the desktop updater dialog all show the same text.
 *
 * Node 24 imports the .ts file directly via native type stripping.
 *
 * Usage:
 *   node scripts/compose-release-notes.mjs <version> <release-body.md> [updater-notes.txt]
 *
 * Exits 1 when the changelog has no entry for <version>.
 */

import { writeFileSync } from "node:fs"

const LABELS = { added: "Added", improved: "Improved", fixed: "Fixed" }

export async function findRelease(version) {
  const moduleUrl = new URL(
    "../apps/web/src/content/changelog.ts",
    import.meta.url
  ).href
  const { releases } = await import(moduleUrl)
  return releases.find((release) => release.version === version)
}

function toMarkdown(release) {
  return release.changes
    .map((change) => `- **${LABELS[change.type]}:** ${change.text}`)
    .join("\n")
}

// The updater dialog renders text verbatim, so no markdown.
function toPlainText(release) {
  return [
    `Version ${release.version}`,
    "",
    ...release.changes.map(
      (change) => `• ${LABELS[change.type]}: ${change.text}`
    ),
  ].join("\n")
}

async function main() {
  const [rawVersion, bodyPath, updaterPath] = process.argv.slice(2)

  if (!rawVersion || !bodyPath) {
    console.error(
      "Usage: node scripts/compose-release-notes.mjs <version> <release-body.md> [updater-notes.txt]"
    )
    process.exit(1)
  }

  const version = rawVersion.replace(/^v/, "")
  const release = await findRelease(version)

  if (!release) {
    console.error(
      `No changelog entry for v${version} in apps/web/src/content/changelog.ts.`
    )
    process.exit(1)
  }

  writeFileSync(bodyPath, `${toMarkdown(release)}\n`)
  if (updaterPath) {
    writeFileSync(updaterPath, `${toPlainText(release)}\n`)
  }
  console.log(`Composed release notes for v${version}.`)
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  await main()
}

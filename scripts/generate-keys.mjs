// Generates the desktop updater signing keypair into the git-ignored `.keys/`
// folder and wires the public key into tauri.conf.json.
//
//   pnpm keys:generate           create keys (refuses to overwrite)
//   pnpm keys:generate --force   replace existing keys
//
// Output (all inside .keys/, never committed):
//   tavo.key       private key  -> GitHub secret TAURI_SIGNING_PRIVATE_KEY
//   tavo.key.pub   public key   -> already written into tauri.conf.json
//   password.txt   key password -> GitHub secret TAURI_SIGNING_PRIVATE_KEY_PASSWORD
//
// The key name follows brand.json's slug. Rotating the key means apps already
// installed with the old public key can no longer verify updates, so only
// --force once nothing signed with the old key has shipped.

import { execFileSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const force = process.argv.includes("--force")

const brand = JSON.parse(readFileSync(join(root, "brand.json"), "utf8"))
const keysDir = join(root, ".keys")
const privateKeyPath = join(keysDir, `${brand.slug}.key`)
const publicKeyPath = `${privateKeyPath}.pub`
const passwordPath = join(keysDir, "password.txt")
const tauriConfPath = join(root, "apps/desktop/src-tauri/tauri.conf.json")

if (existsSync(privateKeyPath) && !force) {
  console.error(
    `${privateKeyPath} already exists. Re-run with --force to replace it.`
  )
  process.exit(1)
}

mkdirSync(keysDir, { recursive: true, mode: 0o700 })

// URL-safe so it survives shells, env files and GitHub secret prompts.
const password = randomBytes(24).toString("base64url")

execFileSync(
  "pnpm",
  [
    "--filter",
    "@workspace/desktop",
    "exec",
    "tauri",
    "signer",
    "generate",
    "--ci",
    "--force",
    "--password",
    password,
    "--write-keys",
    privateKeyPath,
  ],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
)

writeFileSync(passwordPath, `${password}\n`, { mode: 0o600 })
chmodSync(privateKeyPath, 0o600)
chmodSync(passwordPath, 0o600)

const publicKey = readFileSync(publicKeyPath, "utf8").trim()
// Replace just the pubkey line so the rest of the file stays byte-identical.
const tauriConf = readFileSync(tauriConfPath, "utf8")
const updated = tauriConf.replace(/("pubkey":\s*)"[^"]*"/, `$1"${publicKey}"`)
if (updated === tauriConf && !tauriConf.includes(publicKey)) {
  console.error(`Couldn't find "pubkey" in ${tauriConfPath}`)
  process.exit(1)
}
writeFileSync(tauriConfPath, updated)

console.log(`Keys written to ${keysDir}
  ${brand.slug}.key       private key  (keep secret)
  ${brand.slug}.key.pub   public key   (already set in tauri.conf.json)
  password.txt   key password (keep secret)

Local signed build:
  TAURI_SIGNING_PRIVATE_KEY="$(cat .keys/${brand.slug}.key)" \\
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$(cat .keys/password.txt)" \\
  pnpm --filter @workspace/desktop tauri build

CI (GitHub secrets):
  gh secret set TAURI_SIGNING_PRIVATE_KEY < .keys/${brand.slug}.key
  gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD < .keys/password.txt`)

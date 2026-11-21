// @ts-check
/**
 * Single-source-of-truth brand synchronizer (desktop app consumers).
 *
 * `brand.json` (repo root) is the ONLY file you should edit for desktop
 * brand/packaging values. This script propagates those values into:
 *   - structured JSON/TOML configs (tauri.conf.json, Cargo.toml, Cargo.lock)
 *   - generated typed wrappers (apps/desktop/src/lib/brand.ts, brand.rs)
 *   - the Homebrew cask + installer scripts (token-marked / line-keyed)
 *   - icon assets (public/logo.svg -> apps/desktop + full tauri icon set)
 *
 * Public identity (name, tagline, URLs) shared with apps/web and
 * apps/extension stays in `packages/brand` — this script cross-checks that
 * `brand.json.appName` matches it and fails on drift.
 *
 * Derived values (all computed from brand.json — nothing else to keep in sync):
 *   slug      -> crate/binary name, db filename, deep-link scheme, cask token
 *   libName   -> Rust lib crate name (`tavo_lib`, referenced in main.rs)
 *   repoSlug  -> "owner/repo" extracted from the repository URL
 *
 * Modes:
 *   pnpm sync-brand          rewrite all consumers from brand.json
 *   pnpm sync-brand --check  exit 1 if any consumer is out of sync (CI guard)
 */
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");
const CHECK = process.argv.includes("--check");

/** @type {Record<string, any>} */
const brand = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "brand.json"), "utf8"),
);

const repoSlug = brand.repository.replace(/^https:\/\/github\.com\//, "");
const repoGit = `${brand.repository}.git`;

// The Rust crate name. Hyphens are allowed in package names but become
// underscores when referenced as a lib (`tavo` -> `tavo_lib`).
const crateName = brand.slug;
const libName = `${brand.slug.replace(/-/g, "_")}_lib`;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const read = (rel) => {
  const abs = path.join(REPO_ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : undefined;
};

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replace content between `# @brand:start <name>` / `# @brand:end <name>` shell block. */
const applyShellBlock = (text, name, block) =>
  text.replace(
    new RegExp(
      `(^#\\s*@brand:start\\s+${escRe(name)}\\s*\\n)([\\s\\S]*?)(^#\\s*@brand:end\\s+${escRe(name)})`,
      "m",
    ),
    (_, start, _inner, end) => `${start}${block}${end}`,
  );

/** Set a `key = value` line in TOML; returns null if the key is absent. */
const setTomlField = (text, key, value) => {
  const re = new RegExp(`^(${escRe(key)}\\s*=\\s*).*$`, "m");
  if (!re.test(text)) return null;
  return text.replace(re, `$1${value}`);
};

/** Set the `name` field directly under a `[section]` header in TOML.
 *  (Comment lines between the header and the field are allowed.) */
const setTomlSectionName = (text, section, value) => {
  const re = new RegExp(
    `(\\[${escRe(section)}\\]\\n(?:#[^\\n]*\\n)*name\\s*=\\s*").*?(")`,
  );
  if (!re.test(text)) return null;
  return text.replace(re, `$1${value}$2`);
};

/** Set the `version` of a specific `[[package]]` entry in a Cargo.lock file. */
const setCargoLockPackageVersion = (text, packageName, version) => {
  const re = new RegExp(
    `(\\[\\[package\\]\\]\\nname = "${escRe(packageName)}"\\nversion = ").*?(")`,
  );
  if (!re.test(text)) {
    throw new Error(
      `sync-brand: package "${packageName}" not found in Cargo.lock`,
    );
  }
  return text.replace(re, `$1${version}$2`);
};

/** Rename a `[[package]]` entry in a Cargo.lock file (old -> new name). */
const renameCargoLockPackage = (text, oldName, newName) => {
  const re = new RegExp(`(\\[\\[package\\]\\]\\nname = ")${escRe(oldName)}(")`);
  if (!re.test(text)) return text;
  return text.replace(re, `$1${newName}$2`);
};

/** Set a TOML field, inserting after `afterKey` when it does not yet exist. */
const upsertTomlField = (text, key, value, afterKey) => {
  const replaced = setTomlField(text, key, value);
  if (replaced !== null) return replaced;
  const re = new RegExp(`^(${escRe(afterKey)}\\s*=\\s*.*$)`, "m");
  return text.replace(re, `$1\n${key} = ${value}`);
};

/** Replace a line matching `prefix` with `replacement` (full line). */
const setLine = (text, prefix, replacement) => {
  const re = new RegExp(`^${escRe(prefix)}.*$`, "m");
  return text.replace(re, replacement);
};

const collectFiles = (directory, prefix = "") => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory())
      return collectFiles(path.join(directory, entry.name), relative);
    return [relative.split(path.sep).join("/")];
  });
};

const filesMatch = (left, right) =>
  existsSync(left) &&
  existsSync(right) &&
  statSync(left).isFile() &&
  statSync(right).isFile() &&
  readFileSync(left).equals(readFileSync(right));

/** The setup/installer scripts ship with placeholder names (Tymar/tymar) for
 *  any value not covered by the setLine/usage-block replacements (echo copy,
 *  /Applications paths, mktemp templates, env vars). Rewrite them. */
const rebrandNames = (text) =>
  text
    .replace(/Tymar/g, () => brand.appName)
    .replace(/tymar/g, () => brand.slug)
    .replace(/TYMAR/g, () => brand.slug.toUpperCase());

/**
 * Cross-check brand.json.appName against the shared public identity in
 * packages/brand, so the desktop app and the web/extension products can't
 * silently drift apart.
 */
const checkSharedBrand = () => {
  const brandTs = read("packages/brand/src/index.ts") ?? "";
  const match = brandTs.match(/name:\s*"([^"]+)"/);
  const sharedName = match?.[1];
  if (!sharedName) {
    throw new Error(
      "sync-brand: could not read brand.name from packages/brand/src/index.ts",
    );
  }
  if (sharedName !== brand.appName) {
    throw new Error(
      `sync-brand: brand drift — brand.json.appName ("${brand.appName}") != packages/brand name ("${sharedName}")`,
    );
  }
};

const syncAssets = () => {
  const source = path.join(REPO_ROOT, "public/logo.svg");
  if (!existsSync(source)) {
    throw new Error(
      "sync-brand: missing public/logo.svg; add the canonical SVG logo first",
    );
  }

  const assetConsumers = ["apps/desktop/public/logo.svg"];
  const iconOutput = path.join(REPO_ROOT, "apps/desktop/src-tauri/icons");
  const temporaryIcons = mkdtempSync(path.join(tmpdir(), "tavo-icons-"));
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

  try {
    execFileSync(
      pnpm,
      [
        "--filter",
        "@workspace/desktop",
        "exec",
        "tauri",
        "icon",
        source,
        "--output",
        temporaryIcons,
      ],
      { cwd: REPO_ROOT, stdio: CHECK ? "ignore" : "inherit" },
    );

    const generatedIconFiles = collectFiles(temporaryIcons);
    const assetDrift = assetConsumers.filter(
      (consumer) => !filesMatch(source, path.join(REPO_ROOT, consumer)),
    );
    const currentIconFiles = collectFiles(iconOutput);
    const deterministicIconFiles = generatedIconFiles.filter(
      (relative) => relative !== "icon.icns",
    );
    const iconDrift = deterministicIconFiles.some(
      (relative) =>
        !filesMatch(
          path.join(temporaryIcons, relative),
          path.join(iconOutput, relative),
        ),
    );
    const staleIconFiles = currentIconFiles.some(
      (relative) => !generatedIconFiles.includes(relative),
    );
    const missingIcns = !existsSync(path.join(iconOutput, "icon.icns"));

    if (CHECK) {
      if (assetDrift.length || iconDrift || staleIconFiles || missingIcns) {
        console.error(
          "brand: icon assets out of sync — run `pnpm sync-brand`:",
        );
        for (const file of assetDrift) console.error(`  ${file}`);
        if (iconDrift || staleIconFiles || missingIcns) {
          console.error("  apps/desktop/src-tauri/icons/**");
        }
        throw new Error("brand: icon assets are out of sync");
      }
      return;
    }

    for (const consumer of assetConsumers) {
      const destination = path.join(REPO_ROOT, consumer);
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(source, destination);
    }

    const preserveIcns = !iconDrift && !missingIcns;
    const existingIcns = preserveIcns
      ? readFileSync(path.join(iconOutput, "icon.icns"))
      : undefined;
    rmSync(iconOutput, { recursive: true, force: true });
    mkdirSync(iconOutput, { recursive: true });
    for (const relative of generatedIconFiles) {
      const destination = path.join(iconOutput, relative);
      mkdirSync(path.dirname(destination), { recursive: true });
      if (relative === "icon.icns" && existingIcns) {
        writeFileSync(destination, existingIcns);
      } else {
        copyFileSync(path.join(temporaryIcons, relative), destination);
      }
    }
  } finally {
    rmSync(temporaryIcons, { recursive: true, force: true });
  }
};

checkSharedBrand();
syncAssets();

// ---------------------------------------------------------------------------
// generated file bodies
// ---------------------------------------------------------------------------

const GENERATED_NOTE =
  "/**\n * GENERATED BY scripts/sync-brand.mjs — DO NOT EDIT BY HAND.\n * Source of truth: brand.json at the repo root. Run `pnpm sync-brand`.\n */";

const brandTs = `${GENERATED_NOTE}

export const brand = ${JSON.stringify(brand, null, 2)} as const;

export type Brand = typeof brand;
`;

// Emit a `pub const NAME: &str = "...";` line, wrapped the way rustfmt lays
// it out when the single-line form exceeds its 100-char max_width:
//   pub const NAME: &str =
//       "value";
// rustfmt never splits string literals, so this two-line shape is exactly
// what `cargo fmt` produces for any value — keeping `sync-brand:check` and
// `cargo fmt --check` stable without unstable tool attributes.
const constLine = (name, value) => {
  const single = `pub const ${name}: &str = ${JSON.stringify(value)};`
  if (single.length <= 100) return single
  return `pub const ${name}: &str =\n    ${JSON.stringify(value)};`
}

const brandRs = `//! GENERATED BY scripts/sync-brand.mjs — DO NOT EDIT BY HAND.
//! Source of truth: brand.json at the repo root. Run \`pnpm sync-brand\`.
#![allow(dead_code)]

${constLine("APP_NAME", brand.appName)}
${constLine("SLUG", brand.slug)}
${constLine("IDENTIFIER", brand.identifier)}
${constLine("DEVELOPER_NAME", brand.developer.name)}
${constLine("WEBSITE", brand.developer.website)}
${constLine("REPOSITORY", brand.repository)}
${constLine("DOWNLOAD_URL", brand.downloadUrl)}
${constLine("LICENSE_URL", brand.licenseUrl)}
${constLine("COPYRIGHT", brand.copyright)}
${constLine("HOMEBREW_TAP", brand.homebrewTap)}
${constLine("SETUP_SCRIPT_URL", brand.scripts.setupSh)}

/// App version, read from Cargo.toml at compile time.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
`;

// ---------------------------------------------------------------------------
// transforms: each returns the desired file content for a relative path
// ---------------------------------------------------------------------------

const desktopPkg = JSON.parse(read("apps/desktop/package.json"));
desktopPkg.version = brand.version;
desktopPkg.description = `${brand.appName} desktop app — ${brand.description.short}`;
desktopPkg.homepage = brand.developer.website;
desktopPkg.repository.url = repoGit;
desktopPkg.keywords = ["tauri", "desktop", brand.slug];

const tauriConf = JSON.parse(read("apps/desktop/src-tauri/tauri.conf.json"));
tauriConf.productName = brand.appName;
tauriConf.version = brand.version;
tauriConf.identifier = brand.identifier;
tauriConf.app.windows[0].title = brand.appName;
tauriConf.plugins.updater.endpoints[0] = brand.updaterEndpoint;
tauriConf.plugins["deep-link"].desktop.schemes = [brand.slug];
tauriConf.bundle.publisher = brand.developer.name;
tauriConf.bundle.copyright = brand.copyright;
tauriConf.bundle.shortDescription = brand.description.short;
tauriConf.bundle.longDescription = brand.description.long;

// Dev override config: keeps a separate identifier/productName so dev builds
// never collide with the installed production app.
const tauriDevConf = JSON.parse(
  read("apps/desktop/src-tauri/tauri.dev.conf.json"),
);
tauriDevConf.identifier = `${brand.identifier}.dev`;
tauriDevConf.productName = `${brand.appName} Dev`;
tauriDevConf.plugins ??= {};
tauriDevConf.plugins["deep-link"] ??= {};
tauriDevConf.plugins["deep-link"].desktop ??= {};
tauriDevConf.plugins["deep-link"].desktop.schemes = [`${brand.slug}-dev`];

// Cargo.toml: rename the crate + lib BEFORE using the old name to patch
// Cargo.lock (which still refers to the pre-rename package).
const prevCargo = read("apps/desktop/src-tauri/Cargo.toml");
const prevCrateName = prevCargo.match(/\[package\]\s*\nname = "([^"]+)"/)?.[1];

let cargo = prevCargo;
cargo = setTomlSectionName(cargo, "package", crateName) ?? cargo;
cargo = setTomlSectionName(cargo, "lib", libName) ?? cargo;
cargo = upsertTomlField(cargo, "version", `"${brand.version}"`, "name");
cargo = upsertTomlField(
  cargo,
  "description",
  `"${brand.description.short}"`,
  "version",
);
cargo = upsertTomlField(
  cargo,
  "authors",
  `["${brand.developer.name}"]`,
  "edition",
);
cargo = upsertTomlField(
  cargo,
  "homepage",
  `"${brand.developer.website}"`,
  "authors",
);
cargo = upsertTomlField(
  cargo,
  "repository",
  `"${brand.repository}"`,
  "homepage",
);

let cargoLock = read("apps/desktop/src-tauri/Cargo.lock");
if (prevCrateName && prevCrateName !== crateName) {
  cargoLock = renameCargoLockPackage(cargoLock, prevCrateName, crateName);
}
cargoLock = setCargoLockPackageVersion(cargoLock, crateName, brand.version);

// main.rs: the lib crate reference follows the `<slug>_lib::run()` convention.
let mainRs = read("apps/desktop/src-tauri/src/main.rs");
mainRs = mainRs.replace(/^(\s*)[a-z0-9_]+::run\(\)$/m, `$1${libName}::run()`);

// index.html: window title + pre-hydration theme storage key (must match the
// storageKey in src/components/theme-provider.tsx, which reads brand.slug).
let indexHtml = read("apps/desktop/index.html");
indexHtml = indexHtml.replace(
  /(<title>)[^<]*(<\/title>)/,
  `$1${brand.appName}$2`,
);
indexHtml = indexHtml.replace(
  /localStorage\.getItem\("[^"]*"\)/,
  `localStorage.getItem("${brand.slug}-theme")`,
);

// Homebrew cask: fully regenerated from brand.json. version + sha256 are
// release-managed (CI seds them after each release), so they are preserved
// from the existing file when present.
const caskPath = `Casks/${brand.slug}.rb`;
const existingCask = read(caskPath) ?? "";
const caskVersion =
  existingCask.match(/version "([^"]*)"/)?.[1] ?? brand.version;
const caskSha = existingCask.match(/sha256 "([^"]*)"/)?.[1] ?? "no-hash-yet";
const cask = `cask "${brand.slug}" do
  arch arm: "aarch64"

  version "${caskVersion}"
  sha256 "${caskSha}"

  url "https://github.com/${repoSlug}/releases/download/v#{version}/${brand.appName}_#{version}_#{arch}.dmg"
  name "${brand.appName}"
  desc "${brand.description.short}"
  homepage "${brand.repository}"

  depends_on macos: :big_sur
  depends_on arch: :arm64

  app "${brand.appName}.app"

  # Unsigned/un-notarized build: strip the quarantine flag Gatekeeper adds on download.
  postflight do
    system_command "/usr/bin/xattr",
                    args: ["-cr", "#{appdir}/${brand.appName}.app"]
  end

  zap trash: [
    "~/Library/Application Support/${brand.identifier}",
    "~/Library/Caches/${brand.identifier}",
    "~/Library/Preferences/${brand.identifier}.plist",
    "~/Library/Saved Application State/${brand.identifier}.savedState",
  ]
end
`;

const shUsageBlock = `#   curl -fsSL ${brand.scripts.setupSh} | sh
#   curl -fsSL ${brand.scripts.setupSh} | sh -s -- v${brand.version}
`;
let setupSh = read("setup/unix.sh");
setupSh = applyShellBlock(setupSh, "usage", shUsageBlock);
setupSh = setLine(setupSh, `APP_NAME=`, `APP_NAME="${brand.appName}"`);
setupSh = setLine(setupSh, `PACKAGE=`, `PACKAGE="${brand.slug}"`);
setupSh = setLine(setupSh, `TAP=`, `TAP="${brand.homebrewTap}"`);
setupSh = setLine(setupSh, `TAP_URL=`, `TAP_URL="${repoGit}"`);
setupSh = setLine(setupSh, `REPO=`, `REPO="${repoSlug}"`);
setupSh = setLine(
  setupSh,
  `DEFAULT_VERSION=`,
  `DEFAULT_VERSION="v${brand.version}"`,
);
setupSh = rebrandNames(setupSh);

const ps1UsageBlock = `#   irm ${brand.scripts.setupPs1} | iex
`;
let setupPs1 = read("setup/windows.ps1");
setupPs1 = applyShellBlock(setupPs1, "usage", ps1UsageBlock);
setupPs1 = setLine(setupPs1, `$Repo = `, `$Repo = "${repoSlug}"`);
setupPs1 = setLine(setupPs1, `$AppName = `, `$AppName = "${brand.appName}"`);
setupPs1 = setLine(
  setupPs1,
  `$DefaultVersion = `,
  `$DefaultVersion = "v${brand.version}"`,
);
setupPs1 = rebrandNames(setupPs1);

const uninstallShUsageBlock = `#   curl -fsSL ${brand.scripts.uninstallSh} | sh
`;
let uninstallSh = read("setup/unix-uninstall.sh");
uninstallSh = applyShellBlock(uninstallSh, "usage", uninstallShUsageBlock);
uninstallSh = setLine(uninstallSh, `TAP=`, `TAP="${brand.homebrewTap}"`);
uninstallSh = setLine(uninstallSh, `REPO=`, `REPO="${repoSlug}"`);
uninstallSh = setLine(
  uninstallSh,
  `IDENTIFIER=`,
  `IDENTIFIER="${brand.identifier}"`,
);
uninstallSh = setLine(uninstallSh, `APP_NAME=`, `APP_NAME="${brand.appName}"`);
uninstallSh = setLine(uninstallSh, `PACKAGE=`, `PACKAGE="${brand.slug}"`);
uninstallSh = rebrandNames(uninstallSh);

const uninstallPs1UsageBlock = `#   irm ${brand.scripts.uninstallPs1} | iex
`;
let uninstallPs1 = read("setup/windows-uninstall.ps1");
uninstallPs1 = applyShellBlock(uninstallPs1, "usage", uninstallPs1UsageBlock);
uninstallPs1 = setLine(uninstallPs1, `$Repo = `, `$Repo = "${repoSlug}"`);
uninstallPs1 = setLine(
  uninstallPs1,
  `$Identifier = `,
  `$Identifier = "${brand.identifier}"`,
);
uninstallPs1 = setLine(
  uninstallPs1,
  `$AppName = `,
  `$AppName = "${brand.appName}"`,
);
uninstallPs1 = rebrandNames(uninstallPs1);

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

const targets = {
  "apps/desktop/src/lib/brand.ts": brandTs,
  "apps/desktop/src-tauri/src/brand.rs": brandRs,
  "apps/desktop/package.json": `${JSON.stringify(desktopPkg, null, 2)}\n`,
  "apps/desktop/src-tauri/tauri.conf.json": `${JSON.stringify(tauriConf, null, 2)}\n`,
  "apps/desktop/src-tauri/tauri.dev.conf.json": `${JSON.stringify(tauriDevConf, null, 2)}\n`,
  "apps/desktop/src-tauri/Cargo.toml": cargo,
  "apps/desktop/src-tauri/Cargo.lock": cargoLock,
  "apps/desktop/src-tauri/src/main.rs": mainRs,
  "apps/desktop/index.html": indexHtml,
  [caskPath]: cask,
  "setup/unix.sh": setupSh,
  "setup/windows.ps1": setupPs1,
  "setup/unix-uninstall.sh": uninstallSh,
  "setup/windows-uninstall.ps1": uninstallPs1,
};

const drift = [];
for (const [rel, content] of Object.entries(targets)) {
  const current = read(rel);
  if (current === content) continue;
  drift.push(rel);
  if (!CHECK) {
    const destination = path.join(REPO_ROOT, rel);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, content, "utf8");
  }
}

if (CHECK) {
  if (drift.length) {
    console.error("brand: out of sync — run `pnpm sync-brand` and recommit:");
    for (const f of drift) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("brand: in sync ✓");
} else {
  const wrote = drift.length;
  console.log(
    `brand: ${wrote === 0 ? "already in sync ✓" : `synced ${wrote} file${wrote === 1 ? "" : "s"} ✓`}`,
  );
}

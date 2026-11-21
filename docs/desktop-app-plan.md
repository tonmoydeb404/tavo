# Tavo Desktop — Plan

A **macOS menu-bar app** (Tauri 2) for controlling system audio: device
switching, global mic mute, and per-app audio routing.

The app lives in **this monorepo** at `apps/desktop` (package
`@workspace/desktop`), alongside `apps/web` and `apps/extension`. It is a
standalone product: the extension stays browser-only, the desktop app
system-level — no integration between the two is planned.

Everything product-independent comes from `tauri-desktop-template` (CI,
release automation, updater, branding, tray, autostart, SQLite skeleton),
ported into this repo's structure and conventions.

## 1. Problem → feature mapping

| # | Pain point today | Desktop feature | Feasible? |
|---|------------------|-----------------|-----------|
| P1 | No direct way to switch microphones from the macOS menu bar | Device switcher (mic + output) in the tray menu | ✅ Easy — verified |
| P2 | No way to mute the mic globally from the menu bar or a hotkey | Global mic mute (tray + global hotkey), with "mic in use" indicator | ✅ Easy — verified |
| P3 | Can't send Chrome/YouTube audio to speakers while a call app plays to earphones | Per-app output routing (Core Audio process taps) | ✅ Feasible — macOS 14.2+, medium complexity, Phase 2 |

## 2. Feasibility research (verified against current sources)

### 2.1 Switch default input/output device — ✅ no permission needed

CoreAudio HAL properties are **settable by any process**, no TCC permission:

- `kAudioHardwarePropertyDefaultInputDevice`
- `kAudioHardwarePropertyDefaultOutputDevice`
- `kAudioHardwarePropertyDefaultSystemOutputDevice` (system sounds)

via `AudioObjectSetPropertyData` on the system object. Enumeration via
`kAudioHardwarePropertyDevices` + scope checks (`kAudioObjectPropertyScopeInput`
/ `Output`). Property listeners (`AudioObjectAddPropertyListenerBlock`) let us
react to device arrival/removal and external default-device changes.

Precedents: `switchaudio-osx`, Raycast's `set-audio-device` script command, and
a working **Rust** example in `murmur-core` that hand-declares the three C
functions in ~80 lines. `objc2-core-audio` ships full Rust bindings for all of
this.

**macOS quirk (AirPods)**: switching input to a Bluetooth headset needs the
HFP/SCO profile link; macOS establishes it when the default input is set, but
`cpal`-opened devices sometimes miss it. Mitigation (proven in `murmur-core`):
re-set the default input device property as a "nudge" after switching.

### 2.2 Global mic mute + volume — ✅ no permission needed

Device-level mute/volume are device property writes on the input scope
(`kAudioDevicePropertyMute`, `kAudioDevicePropertyVolumeScalar`). No capture,
so no TCC. Fallback: devices without a mute control → set volume to 0.

Bonus (cheap and high-value): `kAudioDevicePropertyDeviceIsRunningSomewhere`
listener = "some app is using the mic right now" indicator in the tray
(precedent: `corti-coreaudio` crate).

### 2.3 Per-app output routing — ✅ feasible, macOS 14.2+

Core Audio **process taps** (Apple's official sample: "Capturing system audio
with Core Audio taps"):

1. List audio-producing processes: `kAudioHardwarePropertyProcessObjectList`;
   map PID → process object via `kAudioHardwarePropertyTranslatePIDToProcessObject`.
2. Create a tap with `CATapDescription` (stereo mixdown of selected processes)
   and **`CATapMuteBehavior::Muted`** — Apple: taps "can mute the process output
   so that the process will no longer play to the speaker… and all process
   output will go to the tap." This mute behavior is the redirect primitive.
3. Put the tap into a **private aggregate device** whose clock/main sub-device
   is the **target physical output** (speakers or earphones), with drift
   compensation on the tap.
4. Read the tapped audio in an IO proc and write it to the target device's
   buffers → the app's audio now plays out of the chosen device.

Requirements:

- `NSAudioCaptureUsageDescription` in Info.plist; TCC prompt
  (`kTCCServiceAudioCapture`, shown in "Privacy & Security → Screen & System
  Audio Recording") on first use. No public preflight API; AudioCap uses a
  private TCC SPI (optional, Developer-ID builds only).
- A properly signed `.app` bundle for reliable TCC behavior (bare binaries are
  flaky — `sound_pref` documents this). Tauri dev builds are ad-hoc signed and
  generally prompt fine; worst case the user grants access manually.
- Without permission the tap still exists but delivers silence (while a muting
  tap still mutes!) — so we must check permission BEFORE creating a muting tap.

Rust support: `objc2-core-audio` exposes `AudioHardwareCreateProcessTap`,
`CATapDescription`, `CATapMuteBehavior`, `AudioHardwareCreateAggregateDevice`
directly; the `coreaudio` crate (feature `process-tap`) offers higher-level
`ProcessTap` + `AppTapAggregateDevice` with a `TapMute` enum. Open-source
precedents doing exactly this in production: `insidegui/AudioCap` (Swift),
`kbshal/sound_pref` (per-app volume + routing, same technique),
`corti-coreaudio` (Rust, hand-declared bindings).

**OS gate**: feature is hidden below macOS 14.2 (runtime check, graceful
degradation message). OS-level per-app **input** routing (which mic an app
records from) is not possible — apps pick their input, usually the default;
changing the default input (2.1) is the supported story.

### 2.4 Out of scope

- Forcing a specific input device on a third-party app (no public API).
- Mac App Store distribution (TCC + private APIs make it hostile) — distribute
  via GitHub Releases + Homebrew cask (ported template automation).

## 3. Monorepo integration

### 3.1 What we take from the template, and where it lands

| Template piece | Lands in tavo as | Adaptation |
|----------------|------------------|------------|
| `apps/desktop/` (Tauri app: React + Vite + Tailwind v4 frontend, `src-tauri/` backend) | `apps/desktop/` | Rename package to `@workspace/desktop`; deps `@packages/ui` → `@workspace/ui`; add `@workspace/brand`; keep `@tauri-apps/*` plugins (opener, dialog, process, updater, autostart, deep-link, single-instance) |
| `src-tauri/src/{lib,tray,commands,db,state,brand,env,deep_link,migrations}` | same paths | Copy as-is; tray/commands get extended per §4. Icons regenerated from Tavo's `icon.svg` via `tauri icon` |
| `scripts/sync-brand.mjs` + `brand.json` | `scripts/sync-brand.mjs` + `brand.json` (repo root) | Point at Tavo values (`appName: Tavo`, slug, `it.tavo.desktop`-style identifier, updater endpoint, homebrew tap); consumers: `tauri.conf.json`, `Cargo.toml`, crate names, desktop `index.html`, `brand.rs`/`brand.ts`, cask, installer scripts |
| `Casks/`, `setup/` (curl/sh + PowerShell installers) | `Casks/`, `setup/` | Rename cask + URLs via sync-brand |
| `.github/workflows/release.yml` (3-platform dmg/deb/msi + updater artifacts + cask update) | `.github/workflows/release.yml` | Keep macOS-focused initially; Windows/Linux jobs stay but only run once targets exist. Add Apple notarization secrets in Phase 3 |
| `docs/TEMPLATE_GUIDE.md` (updater keys, secrets, releasing) | referenced, not copied | Use as the ops manual for Phase 0/3 |
| `apps/web` marketing skeleton | **not ported** — `apps/web` already exists in tavo | The template's updater endpoints/cask URLs point at GitHub Releases, which `@workspace/brand.links.github` already matches |

Versioning: the template bumps `brand.json` version and syncs on
`pnpm release:tag`; tavo's existing `scripts/release-tag-sync.mjs` already does
repo-level versioning — extend it (or wrap sync-brand into it) so desktop
version bumps flow through the same command.

### 3.2 Conventions: tavo rules win

The ported app adopts **this repo's** conventions (AGENTS.md), overriding
template defaults where they differ:

- **Package naming**: `@workspace/desktop` (siblings: `@workspace/web`,
  `@workspace/extension`).
- **Turbo task names**: implement `typecheck` (not the template's
  `check-types`), plus `lint` (eslint, flat config like the other apps) and
  `build` (`tsc && vite build`). `dev` runs `tauri dev` via the existing
  `tauri.dev.conf.json` overlay. Root gets `pnpm dev:desktop`.
- **turbo.json**: add a `@workspace/desktop#build` task with
  `outputs: ["dist/**", "src-tauri/target/**"]` (mirroring how
  `@workspace/extension#build` is special-cased for `.output/**`).
- **File style**: kebab-case filenames, named exports (default exports only for
  framework-mandated files — in a Vite SPA that's just `main.tsx` if needed),
  views structure (`src/views/<name>/index.tsx` + `sections/`), no semicolons,
  2-space indent, `@tabler/icons-react` (already tavo's icon set — the
  template's `lucide-react` default is replaced by `@workspace/ui` usage).
- **UI kit**: `@workspace/ui` (Base UI, `base-maia` shadcn style) — Card,
  Slider, Switch, Label, Tooltip, etc. If a needed primitive is missing, add it
  via `pnpm dlx shadcn@latest add <name> -c apps/desktop` (same flow as web).
- **Type casting / eslint**: same `@workspace/eslint-config` flat presets; the
  Rust side follows `cargo check` + `cargo clippy` gate.
- **AGENTS.md**: add a desktop section — verification commands
  (`pnpm --filter @workspace/desktop typecheck|lint|build`, `cargo check`,
  `cargo clippy` in `apps/desktop/src-tauri`), branding rule
  (`brand.json` + `pnpm sync-brand`), and the Rust module map.
- **knip**: add `apps/desktop` to `knip.json` workspace entry points.

### 3.3 Branding: one source of truth

Tavo currently has `@workspace/brand` (TS, shared identity: name, tagline,
URLs). The template introduces `brand.json` (packaging values: identifier,
version, updater endpoint, cask). To avoid drift:

- `brand.json` = source of truth for **desktop packaging** values.
- `@workspace/brand` = source of truth for **public identity** (shared by web +
  extension; desktop imports it too).
- `sync-brand.mjs` writes desktop consumers **and** verifies that
  `brand.json.appName === brand.name` from `@workspace/brand` (fails CI on
  mismatch). Small, explicit, no codegen into the TS package.

### 3.4 Rust module map (new code under `apps/desktop/src-tauri/src/`)

```
audio/
  hal.rs         # CoreAudio externs / objc2-core-audio wrappers
  devices.rs     # enumerate, defaults, mute/volume, property listeners
  tap.rs         # process taps + private aggregate device (macOS 14.2+, gated)
  router.rs      # routing runtime: per-app sessions (tap -> target output)
commands.rs      # all Tauri IPC commands (template pattern)
tray.rs          # dynamic menu (extends template's rebuild_menu)
state.rs         # AppState: listeners, routing table, settings handle
db.rs            # SQLite (template skeleton)
migrations/      # append-only SQL (presets, settings)
brand.rs / env.rs / deep_link.rs  # already in template
```

### 3.5 Tray (menu bar) design

The tray is the product. The template already rebuilds the menu dynamically;
we rebuild on CoreAudio listener events + process-list polls:

```
[icon reflects state: muted / mic-in-use]
──────────────────────────────
Microphone: MacBook Pro Mic ✓
  ○ MacBook Pro Mic
  ● AirPods Pro
  ○ Studio Display Mic
  ─────────────
  Mute Microphone        ⌥⌘M
──────────────────────────────
Output: Speakers ✓
  ● MacBook Pro Speakers
  ○ AirPods Pro
  ○ Studio Display
──────────────────────────────
Routing (Phase 2)
  Chrome → Speakers ✓
  FaceTime → AirPods Pro ✓
  [app submenu: route to…]
  Stop all routing
──────────────────────────────
Open Tavo…        ⌘,
Check for Updates
Quit Tavo          ⌘Q
```

- Icon swaps between mic-muted / mic-in-use / normal states
  (`icon_as_template(true)` for proper menubar rendering — the template sets
  `false`, we change it).
- Menu items carry stable ids (`device:<uid>`, `route:<pid>`); the handler
  dispatches to commands internally.
- "Mic in use" dot via `kAudioDevicePropertyDeviceIsRunningSomewhere` listener.

### 3.6 Rust → frontend event map

Frontend never polls; Rust emits:

| Event | Source |
|-------|--------|
| `tavo://devices-changed` | device add/remove listener |
| `tavo://defaults-changed` | default input/output listeners (incl. external changes) |
| `tavo://mic-state-changed` | mute toggles + running-somewhere listener |
| `tavo://processes-changed` | process list poll (2 s while routing UI open) |
| `tavo://routing-changed` | router sessions start/stop |

### 3.7 Command surface (Phase 1 + 2)

```rust
// devices
list_audio_devices() -> Vec<AudioDeviceInfo>     // id, uid, name, is_input, is_output, transport
get_default_devices() -> DefaultDevices
set_default_device(uid, kind) -> ()              // input | output | system
set_input_mute(muted) / get_input_mute() -> bool // device-level mute, w/ volume-0 fallback
get_mic_in_use() -> bool

// routing (Phase 2, macOS 14.2+)
list_audio_processes() -> Vec<AudioProcess>      // pid, name, bundle_id, is_audible
route_app(pid, target_device_uid) -> ()          // creates tap+aggregate session
set_app_volume(pid, volume) -> ()                // gain in the router loop
unroute_app(pid) -> ()
get_routing_table() -> Vec<RouteEntry>

// presets
save_preset(name, {output_uid, input_uid, routes}) / apply_preset(id) / list_presets()

// settings/updates: get_settings, set_setting, check_for_update,
// install_update, autostart — already in the template
```

Frontend `src/lib/api.ts` mirrors the template pattern: thin `invoke()`
wrappers + `listen()` subscriptions in `app-context.tsx`; types mirroring
serde output (snake_case from Rust, mapped to camelCase view types).

### 3.8 Persistence

SQLite via the template's db/migrations skeleton:

- `presets` (name, output_uid, input_uid, routes json)
- `settings` (launch behavior, hotkeys, routing defaults)
- Routing table itself is runtime state (devices die; presets re-apply on
  demand or on device arrival if the user opts into "auto-restore").

## 4. Phases

### Phase 0 — Monorepo scaffold (≈1–2 days) — ✅ DONE

- [x] Copy template `apps/desktop` → tavo `apps/desktop`; rename to
      `@workspace/desktop`; swap to `@workspace/ui` + `@workspace/brand` +
      `@workspace/eslint-config` / `typescript-config`.
- [x] Port `sync-brand.mjs` + `brand.json`; fill Tavo values; run sync; add
      `pnpm sync-brand[:check]` scripts; icon set regenerated from
      `public/logo.svg` (Tavo's brand SVG); `Casks/tavo.rb` +
      `setup/*` installers generated.
- [ ] Updater: minisign keypair, pubkey into `tauri.conf.json` (placeholder
      `REPLACE_WITH_UPDATER_PUBLIC_KEY` until then), signing key into GitHub
      secrets (template guide §updater). **User action — blocks releases,
      not development.**
- [x] `release-desktop.yml` (tag `desktop-v*` + cask automation) and
      `desktop-ci.yml` (typecheck/lint/build + brand-drift check + cargo
      check/clippy/fmt on Linux runners).
- [x] turbo.json `@workspace/desktop#build` task, root `dev:desktop` +
      `sync-brand[:check]` scripts, knip entry, AGENTS.md desktop section.
- [x] Demo screens stripped; minimal dashboard skeleton (IPC smoke check,
      Phase 1 placeholder cards, update check) using `@workspace/ui`.
- [x] Acceptance (verified): `pnpm --filter @workspace/desktop
      typecheck|lint|build` clean; `cargo check` + `cargo clippy` +
      `cargo fmt --check` clean; `pnpm sync-brand:check` green; extension +
      ui + desktop turbo build green.
- [ ] GUI smoke test: `pnpm dev:desktop` — tray icon appears, hide-to-tray
      works (needs an interactive session).
- [x] Known pre-existing issue (NOT from this change): `pnpm typecheck` at
      root fails in `apps/web` (`TS2307: Cannot find module './icon.svg'` —
      missing `*.svg` module declaration). Verified identical on clean HEAD
      via a temp worktree. Fix when convenient: add a `declare module "*.svg"`
      ambient d.ts to apps/web.

### Phase 1 — Device switcher + global mic mute (v0.1, ≈1 week) — ✅ code complete

Scope: P1 + P2. No permissions required.

- [x] `audio/hal.rs` + `audio/devices.rs`: enumerate + defaults + set-default
      (with AirPods HFP nudge) + mute ladder (master mute → per-channel →
      volume-zero w/ restore) + volume read/write, on `objc2-core-audio`.
- [x] `audio/watch.rs`: CoreAudio listeners + 250 ms coalescing watcher
      thread — emits `tavo://audio-changed` snapshots, rebuilds the tray,
      swaps the tray icon to a dimmed variant while muted, re-registers
      per-device listeners on default change, re-applies a user mute to a
      new default mic.
- [x] Dynamic tray menu: Microphone header + device radio items + mute
      toggle, Output section, Open/Quit; stable ids (`dev-in:<uid>`,
      `dev-out:<uid>`, `toggle-mute`).
- [x] Tray icon state: dimmed while mic muted (tooltip carries device name).
- [x] Global shortcuts (hardcoded for v1, listed in Settings):
      ⌥⌘M mute toggle, ⌥⌘↑ cycle mic, ⌥⌘↓ cycle output.
- [x] Dashboard view: Mic card (in-use badge, mute switch, volume slider,
      device picker with live default highlight) + Output card (volume
      slider + device picker); optimistic actions reconciled by pushed
      snapshots.
- [x] Settings view: launch-at-login (autostart plugin), hotkey reference,
      update check.
- [x] `.prettierignore` covers the generated `brand.ts` so `pnpm format`
      can't break `sync-brand:check`.
- [x] Acceptance (automated): `tsc`/`eslint`/`vite build` clean;
      `cargo check` + `clippy` (0 warnings) + `fmt --check` clean;
      `sync-brand:check` green.
- [ ] Acceptance (interactive — needs a GUI session): switch mic/output from
      the tray and dashboard; ⌥⌘M mute latency; external device changes
      reflect within ~a second; AirPods input switch establishes HFP
      (nudge); mute survives switching mics; hide-to-tray + reopen.

### Phase 2 — Per-app routing (v0.2, ≈2–3 weeks) — ✅ code complete

Scope: P3. macOS 14.2+, gated at runtime (`routing_supported()` checks the
tap symbol + `CATapDescription` class, both absent on older macOS).

- [x] `audio/tap.rs`: stereo-mixdown process taps via `CATapDescription`
      (mute behavior `Unmuted` for probes, `Muted` for redirects), tap UID
      retrieval, audio-process enumeration (`ProcessObjectList` +
      `IsRunningOutput`), PID → process-object translation.
- [x] `audio/router.rs`: one **private aggregate device per target output**
      (target = clock/main sub-device, taps drift-compensated), a lock-free
      mixing IOProc (tap at position p owns input channels 2p..2p+1,
      per-tap gain atomics, handles interleaved and non-interleaved
      layouts), dynamic tap-list mutation, idempotent teardown, and a
      dead-route sweep (app exited or target unplugged → taps destroyed →
      mute lifts → audio falls back to the default output).
- [x] Permission flow: `NSAudioCaptureUsageDescription` via
      `src-tauri/Info.plist` (auto-merged by the bundler); first route
      **probes with an unmuted tap** (safe — audio keeps playing) and only
      rebuilds as muting once real samples arrive; the probe triggers the
      macOS prompt on first use. Denial → explainer card with
      "Open System Settings" (deep link to Privacy → System Audio
      Recording) + "Re-check". Latency: aggregate clocking means
      CoreAudio handles resampling/drift — no manual buffer tuning; the
      mixing copy is O(samples) with per-tap gain multiplies.
- [x] Routing view: audible-app picker + target-output picker, active-routes
      card with per-route volume sliders, stop buttons, "Stop all routing",
      and the permission explainer. Fully reactive via
      `tavo://audio-changed` snapshots (process list included; a
      `ProcessObjectList` listener feeds it).
- [x] Tray routing section: "Routing" header, one item per active route
      (click to stop), "Stop all routing".
- [x] Deferred (documented decision): one-click presets ("YouTube →
      speakers, calls → earphones") — needs routing *rules* persistence;
      scheduled for v0.3 alongside auto-restore. Routing rules themselves
      are runtime-only in this release.
- [x] Acceptance (automated): tsc/eslint/vite build clean; cargo
      check/clippy (0 warnings)/fmt clean; sync-brand:check green.
- [ ] Acceptance (interactive — needs GUI + macOS 14.2+): route Chrome to
      speakers while FaceTime stays on earphones; no double audio (muting
      behavior); permission prompt flow on first use; unplug target device
      → clean fallback; app quits → all routing stops.

### Phase 3 — Polish + platform reach (v0.3+) — presets shipped; release + platforms are user/platform work

- [x] **Presets + routing rules (v0.3 core)**: SQLite migration v2
      (`routing_rules`, `presets`, `preset_rules`); save current routes as a
      named preset; one-click apply; per-app **auto-restore rules** —
      "remember this route" stores {app name, target UID, volume}, and the
      watcher re-routes matched audible apps whenever they (re)appear
      (permission-gated, 8 s retry cooldown per pid, target-device presence
      check). UI: Rules card (toggle/delete), Presets card (save/apply/
      delete), bookmark button per active route. Tray: "Apply preset: …"
      items.
- [x] Open question #4 resolved by design: auto-restore is opt-in (rules
      exist only when the user creates them).
- [x] **No paid Apple Developer account — routing still works.** TCC's
      "System Audio Recording" permission (the only gate for process taps)
      prompts fine for ad-hoc-signed / unsigned .app bundles; the Developer
      ID certificate is NOT a functional requirement. Decision: skip the
      paid account entirely.
  - **Local use (this machine):** works today — the first routing attempt
    triggers the macOS prompt, or grant manually under System Settings →
    Privacy & Security → Screen & System Audio Recording.
  - **TCC only prompts for a real .app bundle** (verified on-device):
    `tauri dev` runs a bare binary, so the prompt can't be attributed and
    the app never shows up in System Settings — the probe measures silence
    and reports permission-required. For anything routing-related, build
    and run the bundle:
    `TAURI_SIGNING_PRIVATE_KEY=~/.tauri/tavo.key pnpm --filter @workspace/desktop tauri build --debug`
    → `open apps/desktop/src-tauri/target/debug/bundle/macos/Tavo.app`.
    Rebuilds of the debug bundle may re-need the grant (ad-hoc signature
    changes).
  - **Dev builds:** `Tavo Dev` is ad-hoc signed, so each rebuild may need
    the TCC grant re-confirmed (dev-only annoyance; the release build has a
    stable identity). If the prompt doesn't appear, add the app manually in
    System Settings and restart it.
  - **Stable identity for free** (recommended before first release): create
    a self-signed Code Signing certificate in Keychain Access (Certificate
    Assistant → create certificate → Code Signing), then set
    `bundle > macOS > signingIdentity` in tauri.conf.json. A stable
    signature means the TCC grant survives app updates — no paid account
    involved.
  - **Distribution without notarization:** Gatekeeper shows "unidentified
    developer" on first open — handled by right-click → Open, `xattr -cr`,
    or the Homebrew cask (the template's cask already strips the quarantine
    flag postflight). The updater (minisign) and release CI need no paid
    account either.
  - **Notarization**: officially optional now; re-visit only if distribution
    friction becomes a real complaint.
- [ ] Release checklist: updater pubkey (Phase 0), signing secrets,
      `pnpm release:tag patch`, verify `latest.json` + cask sha256 update
      (see open question #6 for the latest-release conflict).
      → Updater keypair GENERATED (free, minisign, no Apple account):
      private key at `~/.tauri/tavo.key` (never commit), public key wired
      into `tauri.conf.json`. For CI, add the private key + an empty
      `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` as GitHub secrets.
- [ ] **Windows** (WASAPI `AudioSessionManager2` per-app volume/mute;
      `IPolicyConfig` default-device + routing): platform port, recommend
      deferring until macOS v1.x is validated (open question #3 → macOS-only
      v1.x). The template CI already builds Windows installers once a
      Windows audio backend lands.
- [ ] **Linux** (PipeWire/Pulse sink-input move): same deferral rationale.
- [ ] **Menu-bar extras**: mic monitoring (optional, requires mic TCC) —
      deferred. Quick preset switching is DONE via the tray presets section.
- [ ] First release checklist: updater pubkey (Phase 0), signing secrets,
      `pnpm release:tag patch`, verify `latest.json` + cask sha256 update
      (see open question #6 for the latest-release conflict).

## 5. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| TCC denial → muting tap mutes audio with silence delivered | Check permission BEFORE creating muting taps; preflight by attempting a non-muting tap + RMS probe; clear recovery UX |
| Private TCC SPI breaks on a macOS update | Treat as optional convenience (AudioCap's build flag); fall back to "attempt and see" |
| AirPods input switch stuck in A2DP (no mic) | Default-input re-set nudge (proven in `murmur-core`); surface device transport type in UI |
| Tap latency / drift artifacts | Aggregate with drift compensation on the tap; clock = target output device; tune IO proc buffer sizes |
| macOS version fragmentation | Runtime gate 14.2+; Phase-1 features work everywhere |
| Unsigned/dev builds and TCC flakiness | Test the real signed bundle; document dev-mode grant path |
| Menu id explosion in tray | Stable id scheme (`device:<uid>`, `route:<pid>`), rebuild menu debounced |
| Rust CoreAudio bindings gaps | `objc2-core-audio` covers the tap API; hand-declared externs as fallback (proven in `corti-coreaudio`) |
| Two brand sources drift (`brand.json` vs `@workspace/brand`) | sync-brand cross-checks `appName` against `@workspace/brand`; CI check fails on mismatch |
| Turbo/root script drift for the new app | Implement tavo task names (`typecheck`/`lint`/`build`), special-case `@workspace/desktop#build` outputs, cover all in AGENTS.md verification block |
| `cargo` targets not cached by turbo | Treat Rust targets as outputs only for packaging; rely on cargo's own incremental cache, run cargo gates in CI directly |

## 6. Open questions

1. Bundle identifier: `it.tavo.desktop` or `com.tavo.desktop`? (drives
   deep-link scheme + updater endpoints in `brand.json`)
2. Dock presence or pure menu-bar app? (template's `Accessory` activation
   policy + `show_window` toggle supports both; pure menu-bar feels right for
   this product)
3. Windows/Linux: build in Phase 3 or keep macOS-only for v1.x?
   → **Resolved: macOS-only for v1.x.** Windows (WASAPI) and Linux
   (PipeWire) ports wait until the macOS app is validated in daily use.
4. Preset auto-restore on device arrival: on by default or opt-in?
   → **Resolved: opt-in by construction.** Auto-restore only runs for rules
   the user explicitly creates ("remember this route").
5. Does the desktop app share the "Tavo" name fully (menu bar + installer say
   "Tavo"), or get a distinguishing suffix ("Tavo Desktop") in menus while the
   bundle stays `Tavo`?
6. Updater endpoint vs GitHub "latest release": both the extension (`v*` tag
   releases) and the desktop app (`desktop-v*` tag releases) publish GitHub
   releases in this repo, but the desktop updater points at
   `releases/latest/download/latest.json` — whichever release was created last
   becomes "latest", so an extension release can temporarily 404 the desktop
   updater. Options: host `latest.json` on tavo.tonmoydeb.com, mark extension
   releases as prereleases (they're ZIPs for the Store anyway), or accept the
   rare window. Decide before the first desktop release.

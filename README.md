# Tavo — Per-tab Volume, Mic, and Webcam Control for Chrome

Tavo is a free, lightweight browser extension that gives you **per-tab
volume control (0–400%)**, **one-click tab muting**, **per-tab microphone
mute**, and **per-tab webcam toggle** — for any playing audio, video, or
WebRTC call in Chrome, Edge, Brave, and other Chromium browsers.

Instead of fumbling with site-specific volume sliders or hunting through
`chrome://settings`, Tavo puts every audio and media control on a single
popup for each open tab. Boost a quiet YouTube video to 400%, mute a noisy
ad without pausing your music, or kill your mic and camera on a tab you
forgot about — all without leaving the page.

> Built on Manifest V3 and the native `chrome.tabs` muting API, Tavo
> silences **all** audio in a tab — including WebRTC streams — and scales
> volume via a per-tab Web Audio gain graph.

---

## Features

| Control                | Range / Behavior                                  | Survives reload? |
| ---------------------- | ------------------------------------------------- | ---------------- |
| **Tab volume**         | 0% – 400% boost above the site's default          | Yes              |
| **Tab mute**           | Browser-native mute (silences all audio + WebRTC) | Yes              |
| **Microphone mute**    | Mutes your mic for the active WebRTC session      | Yes              |
| **Webcam toggle**      | Disables the camera track for the active tab      | Yes              |
| **Per-tab indicator**  | Toolbar counter (up to 3) showing adjusted tabs   | Live             |
| **Per-frame coverage** | Works across iframes and cross-origin embeds      | Automatic        |

- **Volume boost up to 400%** — amplify quiet videos, podcasts, and calls
  beyond the browser's built-in maximum.
- **Independent per-tab state** — every tab remembers its own volume, mute,
  mic, and camera settings for the duration of the session.
- **Survives reloads and navigation** — state is persisted in
  `chrome.storage.session` and re-applied automatically on every page load.
- **Mic and camera isolation** — disable your microphone or webcam on one
  tab without affecting other tabs, calls, or apps.
- **Live toolbar badge** — instantly spot which tabs still have adjustments
  applied (e.g. a tab still muted after a call ends), without opening the
  popup.
- **No tracking, no external servers** — Tavo runs entirely on-device.
  State is wiped the moment you close the browser.

---

## Install

### From the Chrome Web Store

_(Link goes here once published.)_

### Manual load (developer / unpacked)

1. Download the latest build from
   [Releases](https://github.com/tonmoydeb404/tavo/releases), or build from
   source (see [Development](#development) below).
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the built `.output/chrome-mv3`
   directory.

> Tavo requires Chrome 88+ (released January 2021) and is compatible with
> every major Chromium-based browser: Chrome, Edge, Brave, Arc, Vivaldi,
> and Opera.

---

## How it works

Tavo is a Manifest V3 extension split across three layers:

- **Background service worker** — the single source of truth for per-tab
  state. Applies browser-native muting via `chrome.tabs.update({ muted })`
  and persists volume, mic, and camera settings in `chrome.storage.session`.
  State survives service-worker restarts and is wiped when the browser
  closes.
- **Content script (Web Audio gain graph)** — injected into every frame of
  every tab. Connects each `<audio>` / `<video>` / WebRTC `MediaStream`
  element to a `GainNode` and scales amplitude by the configured factor.
  Reports live mic/camera track activity back to the background worker.
- **Popup UI** — a React interface that reads and writes tab state in real
  time, broadcasting changes to every open popup and content script.

The mic mute and camera toggle operate on `getUserStream` tracks captured
by the page itself — useful for muting yourself on a tab you've left open
without affecting your system-level microphone or other calls.

---

## FAQ

### What is Tavo?

Tavo is a free browser extension for Chrome, Edge, and Brave that adds
per-tab volume control (0–400%), tab muting, per-tab microphone mute, and
per-tab webcam toggle. It runs entirely on-device — no account, no
tracking, no external servers.

### How is Tavo different from Chrome's built-in tab mute?

Chrome's native mute only silences a tab completely. Tavo gives you
**fine-grained volume control** (boost up to 400%, not just on/off), plus
independent mic and webcam toggles per tab — and every setting survives
page reloads and navigation.

### Can Tavo boost volume above 100%?

Yes. Tavo applies volume via a Web Audio `GainNode`, so you can amplify a
quiet video or call up to **400%** of its original level. Chrome's
built-in controls cap at 100%.

### Does Tavo work with WebRTC calls (Meet, Zoom web, Slack huddle)?

Yes. Browser-native muting silences all WebRTC audio in the tab, and the
per-tab mic mute and webcam toggle operate directly on the page's
`getUserStream` tracks. Tavo is useful for silently killing your mic on a
tab you've forgotten about.

### Is Tavo private?

Tavo runs entirely on-device. It stores per-tab state in
`chrome.storage.session`, which is wiped when the browser closes. It does
not collect, transmit, or sell any data. The full source code is on
[GitHub](https://github.com/tonmoydeb404/tavo).

### Which browsers does Tavo support?

Any Chromium-based browser version 88 or later: **Chrome, Edge, Brave,
Arc, Vivaldi, and Opera**. Firefox is not currently supported.

### Does Tavo slow down my browser?

No. The background worker is idle between adjustments, and the content
script only attaches a single `GainNode` per media element. The popup is
only mounted when you click the toolbar icon.

### Is Tavo free?

Yes. Tavo is open source under the MIT license and free to use, modify,
and self-host.

---

## Development

Tavo is a pnpm + Turborepo monorepo. Node 20+ is required.

### Structure

```
apps/extension/   # the browser extension (WXT + React)
apps/web/         # Next.js marketing site (App Router, React 19)
packages/ui/      # @workspace/ui — shared shadcn/ui (Base UI) components
packages/eslint-config/
packages/typescript-config/
```

### Getting started

```bash
pnpm install
pnpm dev                            # extension + web dev servers via turbo
pnpm --filter @workspace/extension dev   # extension only
pnpm --filter web dev                    # web app only
```

While the extension dev server is running, load `.output/chrome-mv3-dev`
from `chrome://extensions` (Developer mode → Load unpacked).

### Commands

```bash
pnpm build       # build all packages
pnpm dev         # dev servers for all packages
pnpm lint        # eslint across the workspace
pnpm format      # prettier --write
pnpm typecheck   # tsc --noEmit across the workspace
pnpm clean:workspace   # remove node_modules, caches, and build artifacts
```

### Tech stack

- **[WXT](https://wxt.dev)** — modern WebExtension framework, Manifest V3
- **React 19** — popup UI
- **Web Audio API** — per-tab gain graph for volume scaling
- **`chrome.storage.session`** — per-tab state, survives SW restarts
- **Next.js 16 + App Router** — companion marketing site (`apps/web`)
- **shadcn/ui (Base UI style)** — shared component library
- **Tailwind CSS v4** — styling
- **TypeScript 5** — end-to-end type safety
- **pnpm + Turborepo** — monorepo orchestration

---

## License

MIT © [Tonmoy Deb](https://tonmoydeb.com)

Tavo is open source. Issues, feature requests, and pull requests are
welcome on [GitHub](https://github.com/tonmoydeb404/tavo).

export type ChangeType = "added" | "improved" | "fixed"

export type Change = {
  type: ChangeType
  text: string
}

export type Release = {
  version: string
  date: string
  changes: Change[]
}

export const releases: Release[] = [
  {
    version: "1.2.1",
    date: "2026-11-21",
    changes: [
      {
        type: "fixed",
        text: "The Tavo for Mac release pipeline now builds and publishes the macOS app, so v1.2.0's desktop download and in-app update are available from this version.",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-11-21",
    changes: [
      {
        type: "added",
        text: "Tavo for Mac — a new menu-bar app for macOS system audio. Switch microphones and outputs from the menu bar, mute the mic globally with a hotkey, and route any app's audio to a specific device.",
      },
      {
        type: "added",
        text: "In-app updates for the Mac app, with these release notes shown in the update dialog.",
      },
      {
        type: "improved",
        text: "Redesigned home page and a dedicated Mac app page with a live menu-bar demo. The browser extension now lives at /extension.",
      },
    ],
  },
  {
    version: "1.1.4",
    date: "2026-07-22",
    changes: [
      {
        type: "improved",
        text: 'Mic and camera toggles now default to "no opinion" instead of forcing unmuted — a tab that muted its own mic/camera on join (e.g. Google Meet) is left exactly as-is until you explicitly toggle it from the popup.',
      },
      {
        type: "improved",
        text: "The active tab is now pinned to the top of the mixer list, and rows no longer jump around as tabs are focused.",
      },
      {
        type: "improved",
        text: 'The default (non-"All tabs") mixer view now also surfaces tabs with an active mic or camera, not just tabs producing sound.',
      },
      {
        type: "added",
        text: "The changelog page now opens automatically in a new tab after the extension updates.",
      },
      {
        type: "fixed",
        text: 'Reset now also clears mic/camera overrides, returning a tab to "no opinion" instead of forcing it unmuted/on.',
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-07-20",
    changes: [
      {
        type: "added",
        text: "Initial public release of Audio Tuner — a per-tab media controller for Chromium browsers (Chrome, Edge, Brave).",
      },
      {
        type: "added",
        text: "Per-tab volume sliders from 0 to 400% using the Web Audio API, applied directly in each page's audio context.",
      },
      {
        type: "added",
        text: "Native per-tab mute via chrome.tabs.update({ muted }) — silences one tab without affecting other tabs on the same site, including WebRTC streams (Meet, Zoom web, Teams web).",
      },
      {
        type: "added",
        text: "Per-tab microphone toggle to mute any tab's mic from the toolbar.",
      },
      {
        type: "added",
        text: "Per-tab webcam toggle to turn any tab's camera off from the toolbar.",
      },
      {
        type: "added",
        text: "Audible-only filter so you can focus on tabs currently making sound.",
      },
      {
        type: "added",
        text: "Per-tab badge counter showing how many adjustments (volume, mute, mic, camera) are active on each tab, without opening the popup.",
      },
      {
        type: "added",
        text: "Session-only storage via chrome.storage.session — no servers, no analytics, no account, no data leaving the browser.",
      },
    ],
  },
]

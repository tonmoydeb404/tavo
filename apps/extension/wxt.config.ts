import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  manifest: {
    name: "Audio Tuner",
    description:
      "Mute tabs and adjust per-tab volume (0-400%) for any playing audio or video.",
    permissions: ["tabs", "storage"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "Audio Tuner",
    },
  },
  autoIcons: {
    baseIconPath: "assets/icon.svg",
  },
})

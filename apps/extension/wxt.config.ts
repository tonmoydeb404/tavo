import { brand } from "@workspace/brand"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  manifest: {
    name: brand.name,
    description: brand.description,
    minimum_chrome_version: "88",
    permissions: ["tabs", "storage"],
    host_permissions: ["<all_urls>"],
    homepage_url: brand.url,
    action: {
      default_title: brand.name,
    },
  },
  autoIcons: {
    baseIconPath: "assets/icon.svg",
  },
  zip: {
    name: brand.name,
  },
})

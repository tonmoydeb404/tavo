import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Extension Name",
    description: "A short description of what your extension does.",
    permissions: ["storage"],
    action: {
      default_title: "Extension Name",
    },
  },
})

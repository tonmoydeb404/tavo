// Persistent UI preferences (chrome.storage.local). Survives browser restarts,
// unlike the session-scoped tab state in messaging.ts.

const SHOW_ALL_TABS_KEY = "showAllTabs"

export async function getShowAllTabs(): Promise<boolean> {
  const result = await browser.storage.local.get(SHOW_ALL_TABS_KEY)
  return result[SHOW_ALL_TABS_KEY] === true
}

export async function setShowAllTabs(value: boolean): Promise<void> {
  await browser.storage.local.set({ [SHOW_ALL_TABS_KEY]: value })
}

/**
 * Map of known mock site titles to locally bundled favicons under
 * `/public/favicons`. Same-origin, so `html-to-image` can inline them
 * during screenshot capture without cross-origin fetch failures.
 *
 * Production reads `chrome.tabs.Tab.favIconUrl` directly; this map only
 * resolves favicons for the canned sample data shown in mockups.
 */
const favicons: Record<string, string> = {
  "youtube.com/watch": "/favicons/youtube.png",
  "meet.google.com": "/favicons/meet.png",
  "open.spotify.com": "/favicons/spotify.png",
  "news.bbc.co.uk": "/favicons/bbc.png",
}

function faviconForTitle(title: string): string | undefined {
  return favicons[title.toLowerCase()]
}

export { faviconForTitle }

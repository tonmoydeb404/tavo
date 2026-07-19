// Web Audio gain engine for a single tab. Lives in the MAIN world so it can
// intercept media that the page creates (DOM, off-DOM via `new Audio()`, and
// WebRTC apps like Google Meet) before the page's own scripts cache references.
//
// Three capture mechanisms, all sharing one volume value:
//
//   1. Per-element routing for <audio>/<video>:
//        MediaElement -> MediaElementAudioSourceNode -> gain -> destination
//      Set up from the MAIN-world `play()`/`load()` patches and the DOM
//      MutationObserver.
//
//   2. Per-AudioContext master gain for the page's own Web Audio graphs:
//        pageNode -> ... -> (our foreignGain) -> ctx.destination
//      Inserted by patching `AudioNode.prototype.connect` to redirect any
//      connection targeting a real AudioContext's destination. This is what
//      makes WebRTC apps (Meet, Discord web) adjustable: their remote audio
//      flows through their own AudioContext, which now goes through our gain.
//
//   3. Native `el.volume` fallback for cross-origin media without `crossOrigin`
//      (would be silenced by Web Audio taint). Capped at 100%.
//
// Remaining known limitations (no clean workaround):
//   - Tainted media cannot be boosted above 100% (native `el.volume` caps at 1).
//   - Page Web Audio routed to a MediaStreamAudioDestinationNode (recording /
//     forwarding) rather than the speaker destination is not attenuated.
//
// Input device control (mic/camera), independent of volume:
//
//   4. getUserMedia capture: the MAIN-world patch on
//        `navigator.mediaDevices.getUserMedia` hands each returned MediaStream
//      here. Tracks are stored by kind and toggled via `track.enabled`, which
//      is reversible (silent/black frames, WebRTC connection stays alive).
//      Only streams requested AFTER the patch lands are controllable — a tab
//      already in a call cannot be muted until reloaded.

import { volumeToGain, type TabState } from "./messaging"

const MEDIA_SELECTOR = "audio, video"

type ConnectedMedia = {
  source: MediaElementAudioSourceNode | null // null when tainted (el.volume fallback)
  tainted: boolean
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  private media = new WeakMap<HTMLMediaElement, ConnectedMedia>()
  private taintedMedia = new Set<HTMLMediaElement>()
  // Master gains we've inserted into AudioContexts created by the page.
  // WeakMap for ctx->gain lookup; Set for iteration (WeakMap isn't iterable).
  private foreignGainByCtx = new WeakMap<AudioContext, GainNode>()
  private foreignGains = new Set<GainNode>()
  // Internal gain nodes (ours + the foreign masters) — excluded from the
  // `AudioNode.prototype.connect` patch so we don't recurse or double-route.
  private internalGains = new WeakSet<AudioNode>()
  private observer: MutationObserver | null = null
  private currentVolume = 100
  // Input device (mic/camera) tracks captured via the getUserMedia patch.
  // Stored so a toggle from the bridge can flip `enabled` on all live tracks
  // of a given kind. Removed via `track.ended` so the Sets don't pin dead refs.
  private audioTracks = new Set<MediaStreamTrack>()
  private videoTracks = new Set<MediaStreamTrack>()
  private micMuted = false
  private cameraOff = false
  // Optional listener notified whenever audio/video track counts change, so
  // the host (main.content.ts) can report activity to the background for the
  // popup's "disable button when no media" UX.
  private onActivityChange:
    | ((audio: number, video: number) => void)
    | null = null

  /** Set a listener invoked on every change to mic/camera track counts. */
  setActivityListener(
    listener: (audio: number, video: number) => void,
  ): void {
    this.onActivityChange = listener
  }

  private emitActivity(): void {
    this.onActivityChange?.(this.audioTracks.size, this.videoTracks.size)
  }

  /** Ensure our own AudioContext + master gain exist. Lazy-created. */
  private ensureGraph(): AudioContext | null {
    if (this.ctx) return this.ctx
    if (typeof window.AudioContext !== "function") return null
    try {
      this.ctx = new AudioContext()
      this.gain = this.ctx.createGain()
      this.gain.gain.value = volumeToGain(this.currentVolume)
      this.internalGains.add(this.gain)
      this.gain.connect(this.ctx.destination)
    } catch {
      this.ctx = null
      this.gain = null
      return null
    }
    return this.ctx
  }

  /** Connect a single media element to our gain graph. Idempotent. */
  private connectMedia(el: HTMLMediaElement): void {
    if (this.media.has(el)) return
    const ctx = this.ensureGraph()
    if (!ctx || !this.gain) return

    // Cross-origin media without a `crossOrigin` attribute becomes tainted
    // once routed through Web Audio and goes SILENT. Detect up front and fall
    // back to the native element volume (capped at 100%).
    if (wouldTaint(el)) {
      this.media.set(el, { source: null, tainted: true })
      this.taintedMedia.add(el)
      el.volume = Math.min(1, this.currentVolume / 100)
      return
    }

    let source: MediaElementAudioSourceNode
    try {
      source = ctx.createMediaElementSource(el)
    } catch {
      // Page already connected this element to its own Web Audio graph; the
      // connect() patch will handle attenuation via the page's context.
      return
    }
    source.connect(this.gain)
    this.media.set(el, { source, tainted: false })

    // If the AudioContext is suspended (autoplay policy), try to resume it.
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {})
    }
  }

  /**
   * Public entry point for the MAIN-world prototype patches: register a media
   * element that was just created or about to play. Safe to call repeatedly.
   */
  registerMedia(el: HTMLMediaElement): void {
    this.connectMedia(el)
  }

  /**
   * Returns true if `node` is one of our internal master gains. Used by the
   * `AudioNode.prototype.connect` patch to skip redirecting our own
   * destination connections (which would recurse).
   */
  isInternalGain(node: AudioNode): boolean {
    return this.internalGains.has(node)
  }

  /**
   * Get (or lazily create) a master GainNode inserted into a page-created
   * AudioContext. The foreign gain is connected to `ctx.destination`, and the
   * caller is expected to rewire whatever was connecting to destination onto
   * this gain instead. Returns null if the context can't host a gain.
   */
  getForeignMasterGain(ctx: AudioContext): GainNode | null {
    const existing = this.foreignGainByCtx.get(ctx)
    if (existing) return existing
    try {
      const gain = ctx.createGain()
      gain.gain.value = volumeToGain(this.currentVolume)
      this.internalGains.add(gain)
      gain.connect(ctx.destination)
      this.foreignGainByCtx.set(ctx, gain)
      this.foreignGains.add(gain)
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {})
      }
      // Drop our references when the page closes the context so we don't
      // pin it alive forever.
      ctx.addEventListener(
        "statechange",
        () => {
          if (ctx.state === "closed") {
            this.foreignGainByCtx.delete(ctx)
            this.foreignGains.delete(gain)
          }
        },
        { passive: true }
      )
      return gain
    } catch {
      return null
    }
  }

  /** Walk a node list and connect any media elements found (deep). */
  private connectFromNode(node: Node): void {
    if (node instanceof HTMLMediaElement) {
      this.connectMedia(node)
    }
    if (node instanceof Element) {
      node
        .querySelectorAll<HTMLMediaElement>(MEDIA_SELECTOR)
        .forEach((el) => this.connectMedia(el))
    }
  }

  /** Scan the document for media and connect anything new. */
  private scanAll(): void {
    const nodes = document.querySelectorAll<HTMLMediaElement>(MEDIA_SELECTOR)
    nodes.forEach((el) => this.connectMedia(el))
  }

  /** Start observing the DOM for media elements added later. */
  start(): void {
    this.scanAll()
    if (this.observer) return
    this.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => this.connectFromNode(node))
      }
    })
    this.observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
    })
  }

  /** Apply a volume value (0..400 percent) to all known gain points. */
  applyVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(400, volume))
    const gainValue = volumeToGain(this.currentVolume)

    // Our own AudioContext (media-element routing).
    const ctx = this.ensureGraph()
    if (ctx && this.gain) {
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {})
      }
      this.gain.gain.setTargetAtTime(gainValue, ctx.currentTime, 0.015)
    }

    // Page-created AudioContexts (WebRTC apps, synthesizers, etc.).
    for (const gain of this.foreignGains.values()) {
      gain.gain.setTargetAtTime(gainValue, gain.context.currentTime, 0.015)
    }

    // Tainted elements are controlled via native el.volume (capped 0..1).
    for (const el of this.taintedMedia) {
      el.volume = Math.min(1, this.currentVolume / 100)
    }
  }

  /** Sync the engine to a full TabState (currently just volume). */
  sync(state: TabState): void {
    this.applyVolume(state.volume)
    this.setMicMuted(state.micMuted)
    this.setCameraOff(state.cameraOff)
  }

  /**
   * Register tracks from a MediaStream returned by a patched `getUserMedia`.
   * Convenience wrapper around `registerTrack` (see below).
   */
  registerStream(stream: MediaStream): void {
    for (const track of stream.getTracks()) {
      this.registerTrack(track)
    }
  }

  /**
   * Register a track the page is (or is about to be) sending over a peer
   * connection — the source of truth for "what the remote peer receives".
   * Fed both by getUserMedia capture and by the RTCPeerConnection / RTCRtpSender
   * patches. Toggling `enabled` on these is the reliable mute path: it
   * silences the remote end regardless of any WebAudio processing the page
   * applies between getUserMedia and the sender.
   *
   * Tracks are removed on `ended` so the Sets don't pin dead references.
   * Newly registered tracks immediately adopt the current muted/off state.
   */
  registerTrack(track: MediaStreamTrack): void {
    if (track.kind === "audio") {
      if (this.audioTracks.has(track)) return
      this.audioTracks.add(track)
      track.enabled = !this.micMuted
      track.addEventListener(
        "ended",
        () => {
          this.audioTracks.delete(track)
          this.emitActivity()
        },
        { once: true },
      )
      this.emitActivity()
    } else if (track.kind === "video") {
      if (this.videoTracks.has(track)) return
      this.videoTracks.add(track)
      track.enabled = !this.cameraOff
      track.addEventListener(
        "ended",
        () => {
          this.videoTracks.delete(track)
          this.emitActivity()
        },
        { once: true },
      )
      this.emitActivity()
    }
  }

  /**
   * Toggle all known mic tracks via `track.enabled` (reversible: silent
   * frames, WebRTC connection stays alive). Also remembered so tracks from
   * future getUserMedia calls adopt this state.
   */
  setMicMuted(micMuted: boolean): void {
    this.micMuted = micMuted
    for (const track of this.audioTracks) {
      track.enabled = !micMuted
    }
  }

  /**
   * Toggle all known camera tracks via `track.enabled` (reversible: black
   * frames, WebRTC connection stays alive). Also remembered so tracks from
   * future getUserMedia calls adopt this state.
   */
  setCameraOff(cameraOff: boolean): void {
    this.cameraOff = cameraOff
    for (const track of this.videoTracks) {
      track.enabled = !cameraOff
    }
  }
}

/**
 * Returns true if routing `el` through Web Audio would taint the graph and
 * silence the audio. That happens for cross-origin resources without an
 * explicit `crossOrigin` attribute. Same-origin, blob:, and data: URLs never
 * taint.
 */
function wouldTaint(el: HTMLMediaElement): boolean {
  // Any explicit crossOrigin (including "") opts into CORS mode: either the
  // server allows it (safe) or the load fails visibly (no silence trap).
  if (el.crossOrigin !== null) return false
  const src = el.currentSrc || el.src
  if (!src) return false
  try {
    const url = new URL(src, location.href)
    if (url.origin === location.origin) return false
    if (url.protocol === "blob:" || url.protocol === "data:") return false
    return true
  } catch {
    return false
  }
}

export { AudioEngine }

// MAIN-world content script.
//
// Runs in the page's JS context (not the extension isolated world) so that
// prototype patches land before the page caches references to
// `HTMLMediaElement.prototype.play`, `window.Audio`, and
// `AudioNode.prototype.connect`. Owns the AudioContext + gain graph and
// receives volume commands from the isolated-world bridge via window.postMessage.

import { AudioEngine } from "@/lib"
import { BRIDGE_SOURCE, isBridgeMessage } from "@/lib/messaging"

export default defineContentScript({
  matches: ["<all_urls>"],
  world: "MAIN",
  runAt: "document_start",
  allFrames: true,
  main() {
    const engine = new AudioEngine()
    engine.start()

    // Report per-frame mic/camera track counts to the isolated content script
    // so the background can aggregate across frames and the popup can disable
    // the mic/camera buttons when no track of that kind is live.
    engine.setActivityListener((audio, video) => {
      window.postMessage(
        { source: BRIDGE_SOURCE, kind: "report-activity", audio, video },
        "*",
      )
    })

    // Bridge from the isolated-world content script. We deliberately do NOT
    // check `event.source === window`: cross-world identity of `window` is not
    // guaranteed across browsers, and the typed `isBridgeMessage` check on the
    // payload is sufficient to filter out page noise.
    window.addEventListener("message", (event) => {
      const data: unknown = event.data
      if (!isBridgeMessage(data)) return
      if (data.kind === "apply-volume") {
        engine.applyVolume(data.volume)
      } else if (data.kind === "apply-mic-muted") {
        engine.setMicMuted(data.micMuted)
      } else if (data.kind === "apply-camera-off") {
        engine.setCameraOff(data.cameraOff)
      }
    })

    installMediaElementPatch(engine)
    installAudioConstructorPatch(engine)
    installConnectPatch(engine)
    installGetUserMediaPatch(engine)
    installRtpSenderPatch(engine)
  },
})

/**
 * Patch HTMLMediaElement.prototype.play + load so any element about to play
 * is registered with the engine — including off-DOM `new Audio()` elements.
 */
function installMediaElementPatch(engine: AudioEngine): void {
  const proto = HTMLMediaElement.prototype
  if (typeof proto.play !== "function" || typeof proto.load !== "function") {
    return
  }
  const origPlay = proto.play
  proto.play = function patchedPlay(this: HTMLMediaElement): Promise<void> {
    try {
      engine.registerMedia(this)
    } catch {
      // never let the patch break playback
    }
    return origPlay.call(this)
  }
  const origLoad = proto.load
  proto.load = function patchedLoad(this: HTMLMediaElement): void {
    try {
      engine.registerMedia(this)
    } catch {
      // ignore
    }
    return origLoad.call(this)
  }
}

/**
 * Replace `window.Audio` so `new Audio('x.mp3')` (off-DOM) gets registered
 * before playback starts. Uses Reflect.construct with `new.target` so that
 * subclasses (`class X extends Audio`) still get an instance of the subclass.
 */
function installAudioConstructorPatch(engine: AudioEngine): void {
  const OrigAudio = window.Audio
  if (typeof OrigAudio !== "function") return
  const patched = function Audio(
    this: unknown,
    src?: string
  ): HTMLAudioElement {
    const args: unknown[] = src === undefined ? [] : [src]
    const target = typeof new.target === "function" ? new.target : OrigAudio
    const el: HTMLAudioElement = Reflect.construct(OrigAudio, args, target)
    try {
      engine.registerMedia(el)
    } catch {
      // ignore
    }
    return el
  }
  Object.setPrototypeOf(patched, OrigAudio)
  patched.prototype = OrigAudio.prototype
  // Monkey-patching a global constructor inherently needs a double assertion:
  // a wrapper function's static shape can't satisfy `typeof Audio` exactly.
  // Inline eslint-disable-line stays attached regardless of prettier wrapping.
  // See AGENTS.md for the consistent-type-assertions carve-out.
  window.Audio = patched as unknown as typeof Audio // eslint-disable-line @typescript-eslint/consistent-type-assertions
}

/**
 * Patch AudioNode.prototype.connect so any page Web Audio node that would
 * connect to a real-time AudioContext's destination is redirected through a
 * per-context master gain the engine controls. This is what makes WebRTC apps
 * (Google Meet, Discord web, etc.) adjustable: their remote audio flows
 * through their own AudioContext, and we transparently insert our gain.
 *
 * Exclusions:
 *   - OfflineAudioContext (offline renders must not be mutated)
 *   - MediaStreamAudioDestinationNode (in-page recording / forwarding)
 *   - Our own internal master gains (would recurse)
 */
function installConnectPatch(engine: AudioEngine): void {
  const proto = AudioNode.prototype
  if (typeof proto.connect !== "function") return
  const origConnect = proto.connect

  const patched = function patchedConnect(
    this: AudioNode,
    destination: AudioNode | AudioParam,
    outputIndex?: number,
    inputIndex?: number
  ): AudioNode {
    if (
      destination instanceof AudioDestinationNode &&
      // Don't redirect our own gains (would recurse / double-route).
      !engine.isInternalGain(this)
    ) {
      const ctx = destination.context
      // Only real-time AudioContexts; leave OfflineAudioContext alone.
      if (ctx instanceof AudioContext) {
        const master = engine.getForeignMasterGain(ctx)
        if (master) {
          destination = master
        }
      }
    }
    // Use Reflect.apply to bypass overload resolution: `connect` has both
    // AudioNode-dest (returns AudioNode) and AudioParam-dest (returns void)
    // overloads, and `.call/.apply` picks the wrong one for our union arg.
    return Reflect.apply(origConnect, this, [
      destination,
      outputIndex,
      inputIndex,
    ])
  }
  // Overloaded method monkey-patch: signature can't satisfy both connect()
  // overloads without an assertion. Inline eslint-disable-line stays attached
  // regardless of prettier wrapping. See AGENTS.md carve-out.
  proto.connect = patched as typeof AudioNode.prototype.connect // eslint-disable-line @typescript-eslint/consistent-type-assertions
}

/**
 * Patch `MediaDevices.prototype.getUserMedia` so the engine captures a
 * reference to each returned MediaStream. This is what lets the popup toggle
 * mic/camera for the tab: stored tracks can have `enabled` flipped later.
 *
 * We patch the PROTOTYPE (not the `navigator.mediaDevices` instance) because
 * `navigator.mediaDevices` can be `undefined` at document_start — patching the
 * prototype lands immediately and catches every instance whenever it appears.
 *
 * Same limitation as the media-element patches: only getUserMedia calls made
 * AFTER this patch loads are controllable. A tab already in a call before the
 * extension loaded must be reloaded (see the reload button in the popup).
 */
function installGetUserMediaPatch(engine: AudioEngine): void {
  if (
    typeof MediaDevices !== "function" ||
    typeof MediaDevices.prototype.getUserMedia !== "function"
  ) {
    return
  }
  const proto = MediaDevices.prototype
  const orig = proto.getUserMedia
  proto.getUserMedia = function patchedGetUserMedia(
    this: MediaDevices,
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> {
    return Reflect.apply(orig, this, [constraints]).then((stream) => {
      try {
        engine.registerStream(stream)
      } catch {
        // never let the patch break the page's media request
      }
      return stream
    })
  }
}

/**
 * Patch RTCPeerConnection (addTrack / addTransceiver) and RTCRtpSender
 * (replaceTrack) so the engine captures every track the page actually puts on
 * the wire. This is the reliable mute path: whatever track Meet (or any
 * WebRTC app) sends — raw getUserMedia track or a WebAudio-processed one —
 * must go through one of these APIs, and disabling the sender's track is the
 * spec-guaranteed way to mute the remote end.
 */
function installRtpSenderPatch(engine: AudioEngine): void {
  if (typeof RTCPeerConnection !== "function") return
  const pcProto = RTCPeerConnection.prototype

  if (typeof pcProto.addTrack === "function") {
    const origAddTrack = pcProto.addTrack
    pcProto.addTrack = function patchedAddTrack(
      this: RTCPeerConnection,
      track: MediaStreamTrack,
      ...streams: MediaStream[]
    ): RTCRtpSender {
      try {
        engine.registerTrack(track)
      } catch {
        // ignore
      }
      return Reflect.apply(origAddTrack, this, [track, ...streams])
    }
  }

  if (typeof pcProto.addTransceiver === "function") {
    const origAddTransceiver = pcProto.addTransceiver
    // Overloaded method monkey-patch: signature can't satisfy both
    // addTransceiver(track, init?) and addTransceiver(kind, init?) without an
    // assertion. See AGENTS.md carve-out.
    const patchedAddTransceiver = function patchedAddTransceiver(
      this: RTCPeerConnection,
      trackOrKind: MediaStreamTrack | string,
      init?: RTCRtpTransceiverInit
    ): RTCRtpTransceiver {
      if (typeof trackOrKind !== "string") {
        try {
          engine.registerTrack(trackOrKind)
        } catch {
          // ignore
        }
      }
      return Reflect.apply(origAddTransceiver, this, [trackOrKind, init])
    }
    pcProto.addTransceiver = patchedAddTransceiver as typeof RTCPeerConnection.prototype.addTransceiver // eslint-disable-line @typescript-eslint/consistent-type-assertions
  }

  if (
    typeof RTCRtpSender === "function" &&
    typeof RTCRtpSender.prototype.replaceTrack === "function"
  ) {
    const origReplace = RTCRtpSender.prototype.replaceTrack
    RTCRtpSender.prototype.replaceTrack = function patchedReplaceTrack(
      this: RTCRtpSender,
      withTrack: MediaStreamTrack | null
    ): Promise<void> {
      if (withTrack) {
        try {
          engine.registerTrack(withTrack)
        } catch {
          // ignore
        }
      }
      return Reflect.apply(origReplace, this, [withTrack])
    }
  }
}

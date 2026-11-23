cask "tavo" do
  arch arm: "aarch64"

  version "1.2.2"
  sha256 "d82355d588185c713f7b11304c904866be07a8e1a6e0943953e0b3b27c4c4530"

  url "https://github.com/tonmoydeb404/tavo/releases/download/v#{version}/Tavo_#{version}_#{arch}.dmg"
  name "Tavo"
  desc "Menu-bar audio control for macOS — switch devices, mute the mic, route app audio."
  homepage "https://github.com/tonmoydeb404/tavo"

  depends_on macos: :big_sur
  depends_on arch: :arm64

  app "Tavo.app"

  # Unsigned/un-notarized build: strip the quarantine flag Gatekeeper adds on download.
  postflight do
    system_command "/usr/bin/xattr",
                    args: ["-cr", "#{appdir}/Tavo.app"]
  end

  zap trash: [
    "~/Library/Application Support/com.tavo.desktop",
    "~/Library/Caches/com.tavo.desktop",
    "~/Library/Preferences/com.tavo.desktop.plist",
    "~/Library/Saved Application State/com.tavo.desktop.savedState",
  ]
end

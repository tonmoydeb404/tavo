cask "tavo" do
  arch arm: "aarch64"

  version "1.2.1"
  sha256 "c30ad338de671b534f75a3272cb7527e7294cb9729d72f46fb35ecd33eaed8fb"

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

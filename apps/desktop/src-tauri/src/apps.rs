//! Application picking + icons for the routing UI.
//!
//! The picker is the system's own open panel (via the dialog plugin) filtered
//! to `.app` bundles; icons come straight from `NSWorkspace`, so they are the
//! real ones Finder shows.

use std::path::{Path, PathBuf};

use base64::Engine;
use serde::Serialize;
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PickedApp {
    pub name: String,
    pub path: String,
}

/// Show the macOS file panel (rooted at /Applications) and return the chosen
/// `.app`, or `None` when the user cancels.
#[tauri::command]
pub async fn pick_application(app: AppHandle) -> Result<Option<PickedApp>, String> {
    use tauri_plugin_dialog::DialogExt;

    let picked = tauri::async_runtime::spawn_blocking(move || {
        app.dialog()
            .file()
            .set_title("Choose an app to route")
            .set_directory("/Applications")
            .add_filter("Applications", &["app"])
            .blocking_pick_file()
    })
    .await
    .map_err(|e| e.to_string())?;

    let Some(file) = picked else {
        return Ok(None);
    };
    let path = file.into_path().map_err(|e| e.to_string())?;
    let name = path
        .file_stem()
        .and_then(|n| n.to_str())
        .ok_or("Couldn't read the app name")?
        .to_string();
    Ok(Some(PickedApp {
        name,
        path: path.to_string_lossy().into_owned(),
    }))
}

/// PNG data URL of an app's icon. `key` is a `.app` path, or an app name
/// searched for in the standard application folders. `None` when not found.
#[tauri::command]
pub async fn app_icon(key: String) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || icon_data_url(&key))
        .await
        .ok()
        .flatten()
}

fn resolve_bundle(key: &str) -> Option<PathBuf> {
    if key.starts_with('/') {
        let path = PathBuf::from(key);
        return path.exists().then_some(path);
    }
    let mut dirs = vec![
        PathBuf::from("/Applications"),
        PathBuf::from("/Applications/Utilities"),
        PathBuf::from("/System/Applications"),
        PathBuf::from("/System/Applications/Utilities"),
        PathBuf::from("/System/Cryptexes/App/System/Applications"),
    ];
    if let Some(home) = std::env::var_os("HOME") {
        dirs.push(Path::new(&home).join("Applications"));
    }
    dirs.into_iter()
        .map(|dir| dir.join(format!("{key}.app")))
        .find(|p| p.exists())
}

/// The `.icns` named by the bundle's Info.plist, if it ships one.
fn bundle_icns(bundle: &Path) -> Option<PathBuf> {
    let out = std::process::Command::new("/usr/bin/defaults")
        .arg("read")
        .arg(bundle.join("Contents/Info"))
        .arg("CFBundleIconFile")
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let file = String::from_utf8(out.stdout).ok()?.trim().to_string();
    if file.is_empty() {
        return None;
    }
    let resources = bundle.join("Contents/Resources");
    let named = resources.join(&file);
    let candidate = if named.extension().is_some() {
        named
    } else {
        resources.join(format!("{file}.icns"))
    };
    candidate.exists().then_some(candidate)
}

fn sips_png(input: &Path, output: &Path) -> bool {
    std::process::Command::new("/usr/bin/sips")
        .args(["-Z", "96", "-s", "format", "png"])
        .arg(input)
        .arg("--out")
        .arg(output)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn icon_data_url(key: &str) -> Option<String> {
    let bundle = resolve_bundle(key)?;
    let cache_dir = std::env::temp_dir().join("tavo-icons");
    std::fs::create_dir_all(&cache_dir).ok()?;
    let stem = bundle
        .to_string_lossy()
        .bytes()
        .fold(0xcbf2_9ce4_8422_2325_u64, |h, b| {
            (h ^ u64::from(b)).wrapping_mul(0x0100_0000_01b3)
        });
    // `v2`: earlier cache entries came from a broken conversion.
    let png_path = cache_dir.join(format!("v2-{stem:016x}.png"));

    if !png_path.exists() {
        // Most apps ship an .icns; apps with an asset-catalog icon (Safari,
        // Music…) are rendered through NSWorkspace instead.
        let converted = match bundle_icns(&bundle) {
            Some(icns) => sips_png(&icns, &png_path),
            None => false,
        };
        if !converted {
            std::fs::write(&png_path, icon_png(&bundle)?).ok()?;
        }
    }
    let bytes = std::fs::read(&png_path).ok()?;
    Some(format!(
        "data:image/png;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    ))
}

/// Render the Finder icon for `bundle` to PNG bytes (128px).
#[cfg(target_os = "macos")]
fn icon_png(bundle: &Path) -> Option<Vec<u8>> {
    use objc2::AllocAnyThread;
    use objc2_app_kit::{NSBitmapImageFileType, NSBitmapImageRep, NSWorkspace};
    use objc2_foundation::{NSDictionary, NSPoint, NSRect, NSSize, NSString};

    let workspace = NSWorkspace::sharedWorkspace();
    let image = workspace.iconForFile(&NSString::from_str(&bundle.to_string_lossy()));
    let size = NSSize::new(128.0, 128.0);
    image.setSize(size);
    let mut rect = NSRect::new(NSPoint::new(0.0, 0.0), size);
    let cg = unsafe { image.CGImageForProposedRect_context_hints(&mut rect, None, None) }?;
    let rep = NSBitmapImageRep::initWithCGImage(NSBitmapImageRep::alloc(), &cg);
    let data = unsafe {
        rep.representationUsingType_properties(NSBitmapImageFileType::PNG, &NSDictionary::new())
    }?;
    Some(data.to_vec())
}

#[cfg(not(target_os = "macos"))]
fn icon_png(_bundle: &Path) -> Option<Vec<u8>> {
    None
}

use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::Connection;

use crate::audio::AudioState;

/// Shared state managed by Tauri: database, audio watchers/mute bookkeeping.
pub struct AppState {
    pub db: Mutex<Connection>,
    pub app_data_dir: PathBuf,
    pub audio: AudioState,
}

impl AppState {
    pub fn new(conn: Connection, app_data_dir: PathBuf) -> Self {
        AppState {
            db: Mutex::new(conn),
            app_data_dir,
            audio: AudioState::new(),
        }
    }

    #[allow(dead_code)]
    pub fn logs_dir(&self) -> PathBuf {
        self.app_data_dir.join("logs")
    }
}

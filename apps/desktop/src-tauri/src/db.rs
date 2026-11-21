use std::fs;
use std::path::Path;

use rusqlite::{params, Connection};
use serde::Serialize;

pub type DbResult<T> = Result<T, rusqlite::Error>;

/// Opens (and migrates) the app database. The filename derives from the brand
/// slug (brand.json → brand.rs), so each app gets its own data file.
pub fn open_connection(app_data_dir: &Path) -> DbResult<Connection> {
    fs::create_dir_all(app_data_dir).ok();
    let db_path = app_data_dir.join(format!("{}.db", crate::brand::SLUG));
    let mut conn = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.busy_timeout(std::time::Duration::from_secs(5))?;

    crate::migrations::migrations()
        .to_latest(&mut conn)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

    Ok(conn)
}

// ---- Settings: a simple key-value store for app preferences ----
// Add your own tables via new migrations in src/migrations/sql/.

#[allow(dead_code)]
pub fn get_setting(conn: &Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |r| r.get(0),
    )
    .ok()
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> DbResult<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = ?2",
        params![key, value],
    )?;
    Ok(())
}

pub fn get_all_settings(conn: &Connection) -> DbResult<Vec<(String, String)>> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings ORDER BY key")?;
    let rows = stmt.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

// ---- Routing rules (auto-restore) ----

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutingRuleRow {
    pub id: i64,
    pub app_name: String,
    pub target_uid: String,
    pub volume: f64,
    pub enabled: bool,
}

pub fn add_routing_rule(
    conn: &Connection,
    app_name: &str,
    target_uid: &str,
    volume: f64,
) -> DbResult<()> {
    conn.execute(
        "INSERT INTO routing_rules (app_name, target_uid, volume) VALUES (?1, ?2, ?3)",
        params![app_name, target_uid, volume],
    )?;
    Ok(())
}

pub fn list_routing_rules(conn: &Connection) -> DbResult<Vec<RoutingRuleRow>> {
    let mut stmt = conn.prepare(
        "SELECT id, app_name, target_uid, volume, enabled FROM routing_rules ORDER BY id",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(RoutingRuleRow {
            id: r.get(0)?,
            app_name: r.get(1)?,
            target_uid: r.get(2)?,
            volume: r.get(3)?,
            enabled: r.get::<_, i64>(4)? != 0,
        })
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn delete_routing_rule(conn: &Connection, id: i64) -> DbResult<()> {
    conn.execute("DELETE FROM routing_rules WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn set_routing_rule_enabled(conn: &Connection, id: i64, enabled: bool) -> DbResult<()> {
    conn.execute(
        "UPDATE routing_rules SET enabled = ?2 WHERE id = ?1",
        params![id, enabled as i64],
    )?;
    Ok(())
}

// ---- Presets ----

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetRuleRow {
    pub app_name: String,
    pub target_uid: String,
    pub target_name: String,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetRow {
    pub id: i64,
    pub name: String,
    pub rules: Vec<PresetRuleRow>,
}

/// Save (or replace, by name) a preset from `routes`.
pub fn save_preset(
    conn: &Connection,
    name: &str,
    routes: &[(String, String, String, f64)], // (app_name, target_uid, target_name, volume)
) -> DbResult<i64> {
    conn.execute("DELETE FROM presets WHERE name = ?1", params![name])?;
    conn.execute("INSERT INTO presets (name) VALUES (?1)", params![name])?;
    let preset_id = conn.last_insert_rowid();
    for (position, (app_name, target_uid, _target_name, volume)) in routes.iter().enumerate() {
        conn.execute(
            "INSERT INTO preset_rules (preset_id, app_name, target_uid, volume, position)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![preset_id, app_name, target_uid, volume, position as i64],
        )?;
    }
    Ok(preset_id)
}

pub fn delete_preset(conn: &Connection, id: i64) -> DbResult<()> {
    conn.execute("DELETE FROM presets WHERE id = ?1", params![id])?;
    Ok(())
}

/// All presets with their rules; target names resolved against the CURRENT
/// device list (a preset stores UIDs — names are cosmetic and may have
/// changed since saving).
pub fn list_presets(conn: &Connection) -> DbResult<Vec<PresetRow>> {
    let mut presets = Vec::new();
    {
        let mut stmt = conn.prepare("SELECT id, name FROM presets ORDER BY id")?;
        let rows = stmt.query_map([], |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?)))?;
        for row in rows {
            let (id, name) = row?;
            presets.push((id, name));
        }
    }
    let mut result = Vec::new();
    for (id, name) in presets {
        let mut stmt = conn.prepare(
            "SELECT app_name, target_uid, volume FROM preset_rules
             WHERE preset_id = ?1 ORDER BY position",
        )?;
        let rows = stmt.query_map(params![id], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, f64>(2)?,
            ))
        })?;
        let mut rules = Vec::new();
        for row in rows {
            let (app_name, target_uid, volume) = row?;
            rules.push(PresetRuleRow {
                app_name,
                target_uid,
                target_name: String::new(),
                volume,
            });
        }
        result.push(PresetRow { id, name, rules });
    }
    Ok(result)
}

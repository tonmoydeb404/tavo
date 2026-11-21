use rusqlite_migration::{Migrations, M};

pub fn migrations() -> Migrations<'static> {
    Migrations::new(vec![
        M::up(include_str!("sql/v1__initial.sql")),
        M::up(include_str!("sql/v2__routing_presets.sql")),
        // Add future migrations here:
        // M::up(include_str!("sql/v3__your_next_migration.sql")),
    ])
}

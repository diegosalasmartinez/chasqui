use serde::{de::DeserializeOwned, Serialize};
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const DB_FILE: &str = "db.json";

// Storage keys used in the application
pub mod keys {
    pub const APIS: &str = "apis";
    pub const FOLDERS: &str = "folders";
    pub const ENVIRONMENTS: &str = "environments";
    pub const HISTORY: &str = "history";
}

// Get a typed list from the store, returning an empty Vec if not found
pub fn get_list<T: DeserializeOwned>(app: &AppHandle, key: &str) -> Result<Vec<T>, String> {
    let store = app.store(DB_FILE).map_err(|e| e.to_string())?;
    let val: Value = store.get(key).unwrap_or(json!([]));
    serde_json::from_value(val).map_err(|e| format!("Failed to deserialize {}: {}", key, e))
}

// Set a typed list value in the store
pub fn set_list<T: Serialize>(app: &AppHandle, key: &str, data: &[T]) -> Result<(), String> {
    let store = app.store(DB_FILE).map_err(|e| e.to_string())?;
    let json =
        serde_json::to_value(data).map_err(|e| format!("Failed to serialize {}: {}", key, e))?;
    store.set(key, json);
    Ok(())
}

// Save the store to disk
pub fn save(app: &AppHandle) -> Result<(), String> {
    let store = app.store(DB_FILE).map_err(|e| e.to_string())?;
    store.save().map_err(|e| e.to_string())
}

// Helper to set a list and save in one call
pub fn set_list_and_save<T: Serialize>(
    app: &AppHandle,
    key: &str,
    data: &[T],
) -> Result<(), String> {
    set_list(app, key, data)?;
    save(app)
}

// Helper to set multiple lists and save in one call
pub fn set_lists_and_save<T: Serialize, U: Serialize>(
    app: &AppHandle,
    key1: &str,
    data1: &[T],
    key2: &str,
    data2: &[U],
) -> Result<(), String> {
    set_list(app, key1, data1)?;
    set_list(app, key2, data2)?;
    save(app)
}

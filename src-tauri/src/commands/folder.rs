use crate::core::models::{Api, Folder};
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

#[tauri::command]
pub async fn create_folder(
    app: AppHandle,
    name: String,
    parent_id: Option<String>,
) -> Result<Folder, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("folders").unwrap_or(json!([]));
    let mut folders: Vec<Folder> = serde_json::from_value(val).unwrap_or_default();

    // Validate parent exists if provided
    if let Some(ref pid) = parent_id {
        if !folders.iter().any(|f| &f.id == pid) {
            return Err("Parent folder not found".to_string());
        }
    }

    let folder = Folder {
        id: Uuid::new_v4().to_string(),
        name,
        parent_id,
    };

    folders.push(folder.clone());
    store.set("folders", serde_json::to_value(&folders).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(folder)
}

#[tauri::command]
pub async fn update_folder(
    app: AppHandle,
    id: String,
    name: Option<String>,
    parent_id: Option<Option<String>>,
) -> Result<Folder, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("folders").unwrap_or(json!([]));
    let mut folders: Vec<Folder> = serde_json::from_value(val).unwrap_or_default();

    // Validate new parent exists if provided
    if let Some(Some(ref pid)) = parent_id {
        if !folders.iter().any(|f| &f.id == pid) {
            return Err("Parent folder not found".to_string());
        }
        // Prevent circular reference
        if pid == &id {
            return Err("Folder cannot be its own parent".to_string());
        }
    }

    let folder = folders
        .iter_mut()
        .find(|f| f.id == id)
        .ok_or_else(|| "Folder not found".to_string())?;

    if let Some(new_name) = name {
        folder.name = new_name;
    }
    if let Some(new_parent_id) = parent_id {
        folder.parent_id = new_parent_id;
    }

    let updated = folder.clone();

    store.set("folders", serde_json::to_value(&folders).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_folder(app: AppHandle, id: String) -> Result<(), String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;

    // Get folders
    let folders_val: Value = store.get("folders").unwrap_or(json!([]));
    let mut folders: Vec<Folder> = serde_json::from_value(folders_val).unwrap_or_default();

    // Find the folder to delete
    let folder = folders
        .iter()
        .find(|f| f.id == id)
        .ok_or_else(|| "Folder not found".to_string())?;
    let parent_id = folder.parent_id.clone();

    // Move child folders to parent (or root)
    for f in folders.iter_mut() {
        if f.parent_id.as_ref() == Some(&id) {
            f.parent_id = parent_id.clone();
        }
    }

    // Remove the folder
    folders.retain(|f| f.id != id);

    // Move APIs in this folder to parent (or root)
    let apis_val: Value = store.get("apis").unwrap_or(json!([]));
    let mut apis: Vec<Api> = serde_json::from_value(apis_val).unwrap_or_default();

    for api in apis.iter_mut() {
        if api.folder_id.as_ref() == Some(&id) {
            api.folder_id = parent_id.clone();
        }
    }

    // Persist changes
    store.set("folders", serde_json::to_value(&folders).unwrap());
    store.set("apis", serde_json::to_value(&apis).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn list_folders(app: AppHandle) -> Result<Vec<Folder>, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("folders").unwrap_or(json!([]));
    let folders: Vec<Folder> = serde_json::from_value(val).unwrap_or_default();

    Ok(folders)
}

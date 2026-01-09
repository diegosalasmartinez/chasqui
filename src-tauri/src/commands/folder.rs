use crate::core::{
    models::{Api, Folder},
    storage::{self, keys},
};
use tauri::AppHandle;
use uuid::Uuid;

#[tauri::command]
pub async fn create_folder(
    app: AppHandle,
    name: String,
    parent_id: Option<String>,
) -> Result<Folder, String> {
    let mut folders: Vec<Folder> = storage::get_list(&app, keys::FOLDERS)?;

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
    storage::set_list_and_save(&app, keys::FOLDERS, &folders)?;

    Ok(folder)
}

#[tauri::command]
pub async fn update_folder(
    app: AppHandle,
    id: String,
    name: Option<String>,
    parent_id: Option<Option<String>>,
) -> Result<Folder, String> {
    let mut folders: Vec<Folder> = storage::get_list(&app, keys::FOLDERS)?;

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

    storage::set_list_and_save(&app, keys::FOLDERS, &folders)?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_folder(app: AppHandle, id: String) -> Result<(), String> {
    let mut folders: Vec<Folder> = storage::get_list(&app, keys::FOLDERS)?;

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
    let mut apis: Vec<Api> = storage::get_list(&app, keys::APIS)?;

    for api in apis.iter_mut() {
        if api.folder_id.as_ref() == Some(&id) {
            api.folder_id = parent_id.clone();
        }
    }

    // Persist changes
    storage::set_lists_and_save(&app, keys::FOLDERS, &folders, keys::APIS, &apis)?;

    Ok(())
}

#[tauri::command]
pub fn list_folders(app: AppHandle) -> Result<Vec<Folder>, String> {
    storage::get_list(&app, keys::FOLDERS)
}

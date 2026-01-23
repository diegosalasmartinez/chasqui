use crate::core::{
    models::Workspace,
    storage::{self, keys},
};
use tauri::AppHandle;
use uuid::Uuid;

const DEFAULT_WORKSPACE_NAME: &str = "Default Workspace";

#[tauri::command]
pub fn list_workspaces(app: AppHandle) -> Result<Vec<Workspace>, String> {
    let mut workspaces: Vec<Workspace> = storage::get_list(&app, keys::WORKSPACES)?;

    // Create default workspace if none exist
    if workspaces.is_empty() {
        let default = Workspace {
            id: Uuid::new_v4().to_string(),
            name: DEFAULT_WORKSPACE_NAME.to_string(),
        };
        workspaces.push(default);
        storage::set_list_and_save(&app, keys::WORKSPACES, &workspaces)?;
    }

    Ok(workspaces)
}

#[tauri::command]
pub async fn create_workspace(app: AppHandle, name: String) -> Result<Workspace, String> {
    let mut workspaces: Vec<Workspace> = storage::get_list(&app, keys::WORKSPACES)?;

    let workspace = Workspace {
        id: Uuid::new_v4().to_string(),
        name,
    };

    workspaces.push(workspace.clone());
    storage::set_list_and_save(&app, keys::WORKSPACES, &workspaces)?;

    Ok(workspace)
}

#[tauri::command]
pub async fn update_workspace(
    app: AppHandle,
    id: String,
    name: String,
) -> Result<Workspace, String> {
    let mut workspaces: Vec<Workspace> = storage::get_list(&app, keys::WORKSPACES)?;

    let workspace = workspaces
        .iter_mut()
        .find(|w| w.id == id)
        .ok_or_else(|| "Workspace not found".to_string())?;

    workspace.name = name;
    let updated = workspace.clone();

    storage::set_list_and_save(&app, keys::WORKSPACES, &workspaces)?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_workspace(app: AppHandle, id: String) -> Result<(), String> {
    let mut workspaces: Vec<Workspace> = storage::get_list(&app, keys::WORKSPACES)?;

    // Prevent deleting the last workspace
    if workspaces.len() <= 1 {
        return Err("Cannot delete the last workspace".to_string());
    }

    let before = workspaces.len();
    workspaces.retain(|w| w.id != id);

    if workspaces.len() == before {
        return Err("Workspace not found".to_string());
    }

    storage::set_list_and_save(&app, keys::WORKSPACES, &workspaces)?;

    Ok(())
}

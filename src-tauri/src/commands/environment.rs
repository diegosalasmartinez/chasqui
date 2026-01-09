use crate::core::{
    models::{EnvVariable, Environment},
    storage::{self, keys},
};
use tauri::AppHandle;
use uuid::Uuid;

#[tauri::command]
pub fn list_environments(app: AppHandle) -> Result<Vec<Environment>, String> {
    storage::get_list(&app, keys::ENVIRONMENTS)
}

#[tauri::command]
pub async fn create_environment(
    app: AppHandle,
    name: String,
    workspaceId: Option<String>,
) -> Result<Environment, String> {
    let mut environments: Vec<Environment> = storage::get_list(&app, keys::ENVIRONMENTS)?;

    let environment = Environment {
        id: Uuid::new_v4().to_string(),
        name,
        workspace_id: workspaceId,
        variables: vec![],
    };

    environments.push(environment.clone());
    storage::set_list_and_save(&app, keys::ENVIRONMENTS, &environments)?;

    Ok(environment)
}

#[tauri::command]
pub async fn update_environment(
    app: AppHandle,
    id: String,
    name: Option<String>,
    variables: Option<Vec<EnvVariable>>,
) -> Result<Environment, String> {
    let mut environments: Vec<Environment> = storage::get_list(&app, keys::ENVIRONMENTS)?;

    let environment = environments
        .iter_mut()
        .find(|e| e.id == id)
        .ok_or_else(|| "Environment not found".to_string())?;

    if let Some(new_name) = name {
        environment.name = new_name;
    }
    if let Some(new_variables) = variables {
        environment.variables = new_variables;
    }

    let updated = environment.clone();

    storage::set_list_and_save(&app, keys::ENVIRONMENTS, &environments)?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_environment(app: AppHandle, id: String) -> Result<(), String> {
    let mut environments: Vec<Environment> = storage::get_list(&app, keys::ENVIRONMENTS)?;

    let before = environments.len();
    environments.retain(|e| e.id != id);

    if environments.len() == before {
        return Err("Environment not found".into());
    }

    storage::set_list_and_save(&app, keys::ENVIRONMENTS, &environments)?;

    Ok(())
}

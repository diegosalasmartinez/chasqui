use crate::core::models::{EnvVariable, Environment};
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

#[tauri::command]
pub fn list_environments(app: AppHandle) -> Result<Vec<Environment>, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("environments").unwrap_or(json!([]));
    let environments: Vec<Environment> = serde_json::from_value(val).unwrap_or_default();
    Ok(environments)
}

#[tauri::command]
pub async fn create_environment(
    app: AppHandle,
    name: String,
    workspaceId: Option<String>,
) -> Result<Environment, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("environments").unwrap_or(json!([]));
    let mut environments: Vec<Environment> = serde_json::from_value(val).unwrap_or_default();

    let environment = Environment {
        id: Uuid::new_v4().to_string(),
        name,
        workspace_id: workspaceId,
        variables: vec![],
    };

    environments.push(environment.clone());
    store.set("environments", serde_json::to_value(&environments).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(environment)
}

#[tauri::command]
pub async fn update_environment(
    app: AppHandle,
    id: String,
    name: Option<String>,
    variables: Option<Vec<EnvVariable>>,
) -> Result<Environment, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("environments").unwrap_or(json!([]));
    let mut environments: Vec<Environment> = serde_json::from_value(val).unwrap_or_default();

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

    store.set("environments", serde_json::to_value(&environments).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_environment(app: AppHandle, id: String) -> Result<(), String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("environments").unwrap_or(json!([]));
    let mut environments: Vec<Environment> = serde_json::from_value(val).unwrap_or_default();

    let before = environments.len();
    environments.retain(|e| e.id != id);

    if environments.len() == before {
        return Err("Environment not found".into());
    }

    store.set("environments", serde_json::to_value(&environments).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

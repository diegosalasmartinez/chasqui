use crate::core::{
    http_client,
    models::{Api, HistoryItem, Request, Response},
    storage::{self, keys},
};
use tauri::AppHandle;
use uuid::Uuid;

const HISTORY_LIMIT: usize = 50;

#[tauri::command]
pub async fn create_api(
    app: AppHandle,
    name: String,
    request: Request,
    #[allow(non_snake_case)] folderId: Option<String>,
    #[allow(non_snake_case)] workspaceId: Option<String>,
) -> Result<Api, String> {
    let mut apis: Vec<Api> = storage::get_list(&app, keys::APIS)?;

    let record = Api {
        id: Uuid::new_v4().to_string(),
        name,
        folder_id: folderId,
        workspace_id: workspaceId,
        request,
    };
    apis.push(record.clone());
    storage::set_list_and_save(&app, keys::APIS, &apis)?;

    Ok(record)
}

#[tauri::command]
pub async fn save_api(
    app: AppHandle,
    id: String,
    name: Option<String>,
    request: Option<Request>,
) -> Result<Api, String> {
    let mut apis: Vec<Api> = storage::get_list(&app, keys::APIS)?;

    let updated: Api = {
        let record = apis
            .iter_mut()
            .find(|r| r.id == id)
            .ok_or_else(|| "Request not found".to_string())?;

        if let Some(new_name) = name {
            record.name = new_name;
        }
        if let Some(new_req) = request {
            record.request = new_req;
        }

        record.clone()
    };

    storage::set_list_and_save(&app, keys::APIS, &apis)?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_api(app: AppHandle, id: String) -> Result<(), String> {
    let mut apis: Vec<Api> = storage::get_list(&app, keys::APIS)?;

    let before = apis.len();
    apis.retain(|r| r.id != id);

    if apis.len() == before {
        return Err("Request not found".into());
    }

    storage::set_list_and_save(&app, keys::APIS, &apis)?;

    Ok(())
}

#[derive(Debug, serde::Serialize, Clone)]
pub struct SendRequestResult {
    pub response: Response,
    pub history_entry: HistoryItem,
}

#[tauri::command]
pub async fn send_request(
    app: AppHandle,
    request: Request,
    #[allow(non_snake_case)] workspaceId: Option<String>,
) -> Result<SendRequestResult, String> {
    let out = http_client::send(&request).await?;

    let mut hist: Vec<HistoryItem> = storage::get_list(&app, keys::HISTORY)?;

    let at_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Failed to get system time: {}", e))?
        .as_millis();

    let history_entry = HistoryItem {
        id: Uuid::new_v4().to_string(),
        at_ms,
        workspace_id: workspaceId,
        request,
        response: out.clone(),
    };

    hist.insert(0, history_entry.clone());

    // Enforce history limit
    hist.truncate(HISTORY_LIMIT);

    storage::set_list_and_save(&app, keys::HISTORY, &hist)?;

    Ok(SendRequestResult {
        response: out,
        history_entry,
    })
}

#[tauri::command]
pub fn list_history(app: AppHandle) -> Result<Vec<HistoryItem>, String> {
    storage::get_list(&app, keys::HISTORY)
}

#[tauri::command]
pub fn clear_history(app: AppHandle) -> Result<(), String> {
    storage::set_list_and_save::<HistoryItem>(&app, keys::HISTORY, &[])
}

#[tauri::command]
pub fn list_apis(app: AppHandle) -> Result<Vec<Api>, String> {
    storage::get_list(&app, keys::APIS)
}

#[tauri::command]
pub async fn move_api(
    app: AppHandle,
    id: String,
    #[allow(non_snake_case)] folderId: Option<String>,
) -> Result<Api, String> {
    let mut apis: Vec<Api> = storage::get_list(&app, keys::APIS)?;

    let api = apis
        .iter_mut()
        .find(|a| a.id == id)
        .ok_or_else(|| "API not found".to_string())?;

    api.folder_id = folderId;
    let updated = api.clone();

    storage::set_list_and_save(&app, keys::APIS, &apis)?;

    Ok(updated)
}

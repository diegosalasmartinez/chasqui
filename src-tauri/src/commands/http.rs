use crate::core::{
    http_client,
    models::{Api, HistoryItem, Request, Response},
};
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

#[tauri::command]
pub async fn create_api(
    app: AppHandle,
    name: String,
    request: Request,
    folder_id: Option<String>,
) -> Result<Api, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("apis").unwrap_or(json!([]));
    let mut apis: Vec<Api> = serde_json::from_value(val).unwrap_or_default();

    let record = Api {
        id: Uuid::new_v4().to_string(),
        name,
        folder_id,
        request,
    };
    apis.push(record.clone());
    store.set("apis", serde_json::to_value(&apis).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(record)
}

#[tauri::command]
pub async fn save_api(
    app: AppHandle,
    id: String,
    name: Option<String>,
    request: Option<Request>,
) -> Result<Api, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("apis").unwrap_or(json!([]));
    let mut requests: Vec<Api> = serde_json::from_value(val).unwrap_or_default();

    let updated: Api = {
        let record = requests
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

    let updated_json = serde_json::to_value(&requests).map_err(|e| e.to_string())?;
    store.set("apis", updated_json);
    store.save().map_err(|e| e.to_string())?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_api(app: AppHandle, id: String) -> Result<(), String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("apis").unwrap_or(json!([]));
    let mut requests: Vec<Api> = serde_json::from_value(val).unwrap_or_default();

    let before = requests.len();
    requests.retain(|r| r.id != id);

    if requests.len() == before {
        return Err("Request not found".into());
    }

    // Persist changes
    let updated_json = serde_json::to_value(&requests).map_err(|e| e.to_string())?;
    store.set("apis", updated_json);
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn send_request(app: AppHandle, request: Request) -> Result<Response, String> {
    let out = http_client::send(&request).await?;

    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("history").unwrap_or(json!([]));
    let mut hist: Vec<HistoryItem> = serde_json::from_value(val).unwrap_or_default();

    hist.insert(
        0,
        HistoryItem {
            at_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis(),
            request: request,
            response: out.clone(),
        },
    );
    store.set("history", serde_json::to_value(&hist).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(out)
}

#[tauri::command]
pub fn list_history(app: AppHandle) -> Result<Vec<HistoryItem>, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("history").unwrap_or(json!([]));
    let hist: Vec<HistoryItem> = serde_json::from_value(val).unwrap_or_default();

    Ok(hist)
}

#[tauri::command]
pub fn list_apis(app: AppHandle) -> Result<Vec<Api>, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("apis").unwrap_or(json!([]));
    let apis: Vec<Api> = serde_json::from_value(val).unwrap_or_default();

    Ok(apis)
}

#[tauri::command]
pub async fn move_api(
    app: AppHandle,
    id: String,
    folderId: Option<String>,
) -> Result<Api, String> {
    let store = app.store("db.json").map_err(|e| e.to_string())?;
    let val: Value = store.get("apis").unwrap_or(json!([]));
    let mut apis: Vec<Api> = serde_json::from_value(val).unwrap_or_default();

    let api = apis
        .iter_mut()
        .find(|a| a.id == id)
        .ok_or_else(|| "API not found".to_string())?;

    api.folder_id = folderId;
    let updated = api.clone();

    store.set("apis", serde_json::to_value(&apis).unwrap());
    store.save().map_err(|e| e.to_string())?;

    Ok(updated)
}

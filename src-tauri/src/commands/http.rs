use crate::app_state::AppState;
use crate::core::{
    http_client,
    models::{HistoryItem, Request, Response},
};
use tauri::State;

#[tauri::command]
pub async fn send_request(state: State<'_, AppState>, input: Request) -> Result<Response, String> {
    let out = http_client::send(&input).await?;

    // Short lock to mute state
    {
        let mut st = state.lock().unwrap();
        st.history.push(HistoryItem {
            at_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis(),
            request: input.clone(),
            response: out.clone(),
        });
    }

    Ok(out)
}

#[tauri::command]
pub fn list_history(state: State<'_, AppState>) -> Result<Vec<HistoryItem>, String> {
    let st = state.lock().unwrap();
    Ok(st.history.clone())
}

mod app_state;
mod commands;
mod core;

use std::sync::Mutex;
use tauri::{Builder, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(app_state::AppStateInner::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::http::send_request,
            commands::http::list_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

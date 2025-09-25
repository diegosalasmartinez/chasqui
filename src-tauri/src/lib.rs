mod commands;
mod core;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::http::create_api,
            commands::http::save_api,
            commands::http::delete_api,
            commands::http::send_request,
            commands::http::list_history,
            commands::http::list_apis
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

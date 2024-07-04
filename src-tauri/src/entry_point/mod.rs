use crate::github;
use crate::store;

mod commands;

pub fn start_app() {
    tauri::Builder::default()
        .manage(store::in_memory_store::ModelStore::default())
        .manage(github::remote::Github::new())
        .setup(|_| {
            println!("creating github client");
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let store =
                tauri_plugin_store::StoreBuilder::new("store.bin").build(app.handle().clone());
            let _ = tauri_plugin_store::Builder::default().store(store);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_into_store,
            commands::load_from_store,
            commands::load_from_github,
            commands::load_from_local,
            commands::load_into_local,
            commands::delete_local,
            commands::delete_memory,
            commands::delete_local_and_memory_dep,
            commands::load_gh_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

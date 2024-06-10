// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::filter::load_with_filter;
use crate::loader::{load_flat, DepError};
use crate::read_model::FlatDep;

mod filter;
mod loader;
mod read_model;
mod representation;

#[tauri::command]
fn load_flattend_filter(name: &str, filter: &str) -> String {
    let res: Result<Vec<FlatDep>, DepError> = if filter.is_empty() {
        load_flat(name)
    } else {
        load_with_filter(name, filter)
    };

    match res {
        Ok(res) => serde_json::to_string_pretty(&res).unwrap(),
        Err(e) => format!("{:#?}", e),
    }
}

pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        // Initialize the plugin
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![load_flattend_filter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

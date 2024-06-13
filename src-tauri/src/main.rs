// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::filter::filter_deps;
use crate::loader::{load_flat, DepError};
use crate::read_model::FlatDep;
use tauri::State;

mod filter;
mod in_memory_store;
mod loader;
mod read_model;
mod representation;
mod github;

#[tauri::command]
fn load_from_store(filter: &str, store: State<in_memory_store::ModelStore>) -> String {
    let res: Result<Vec<FlatDep>, DepError> = if filter.is_empty() {
        Ok(store.all())
    } else {
        Ok(filter_deps(filter, store.all()))
    };

    match res {
        Ok(res) => serde_json::to_string_pretty(&res).unwrap(),
        Err(e) => format!("{:#?}", e),
    }
}

#[tauri::command]
fn load_into_store(name: &str, store: State<in_memory_store::ModelStore>) {
    println!("trying to get deps from: {:#?}", name);
    let res = load_flat(name);
    match res {
        Ok(res) => store.add(res),
        Err(e) =>   println!("{:#?}", e),
    }
}

#[tauri::command]
fn load_from_github(org: &str, token: &str, github_remote: State<github::remote::Github>) {
    println!("trying to get deps from: {:#?}", org);
    let res = github::get_deps_from_github(org, token, github_remote.inner());
    match res {
        Ok(res) => println!("{:#?}", res),
        Err(e) => println!("{:#?}", e),
    }
}

pub fn main() {
    tauri::Builder::default()
        .manage(in_memory_store::ModelStore::default())
        .manage(github::remote::Github::new())
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
        .invoke_handler(tauri::generate_handler![load_into_store, load_from_store, load_from_github])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

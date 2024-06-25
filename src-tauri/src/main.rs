// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use crate::dep_core::DepError;
use crate::dep_core::FlatDep;
use serde_json::json;
use tauri::Manager;
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::with_store;

mod dep_core;
mod github;
mod renovate;
mod store;

#[tauri::command]
fn load_from_store(filter: &str, store: State<store::in_memory_store::ModelStore>) -> String {
    let res: Result<Vec<FlatDep>, DepError> = if filter.is_empty() {
        Ok(store.all())
    } else {
        Ok(store::filter::filter_deps(filter, store.all()))
    };

    match res {
        Ok(res) => serde_json::to_string_pretty(&res).unwrap(),
        Err(e) => format!("{:#?}", e),
    }
}

#[tauri::command]
fn load_into_store(name: &str, store: State<store::in_memory_store::ModelStore>) {
    println!("trying to get deps from file: {:#?}", name);
    let res = renovate::loader::load_flat_from_file(name);
    match res {
        Ok(res) => store.add(res),
        Err(e) => println!("{:#?}", e),
    }
    println!("deps from file stored");
}

#[tauri::command]
async fn load_from_github(
    org: String,
    token: String,
    github_remote: State<'_, github::remote::Github>,
    store: State<'_, store::in_memory_store::ModelStore>,
) -> Result<(), ()> {
    println!("trying to get deps from github: {:#?}", org);
    let res = github::get_deps_from_github(&org, &token, github_remote.inner()).await;
    let deps = match res {
        Ok(res) => res,
        Err(e) => {
            eprintln!("{e}");
            return Ok(());
        }
    };
    let as_flat: Vec<FlatDep> = deps.iter().map(|g| g.to_flat_dep(&org)).collect();
    store.add(as_flat);
    println!("github deps stored");
    Ok(())
}

#[tauri::command]
async fn load_into_local(
    in_memory_store: State<'_, store::in_memory_store::ModelStore>,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    let stores = app_handle.state::<tauri_plugin_store::StoreCollection<Wry>>();
    let path = PathBuf::from("store.bin");

    let _ = with_store(app_handle.to_owned(), stores, path, |store| {
        in_memory_store.all().iter().for_each(|fd| {
            let _ = store.insert(fd.uuid.to_string(), json!(fd));
        });
        Ok(())
    });
    println!("deps stored");
    Ok(())
}

#[tauri::command]
async fn load_from_local(
    in_memory_store: State<'_, store::in_memory_store::ModelStore>,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    let stores = app_handle.state::<tauri_plugin_store::StoreCollection<Wry>>();
    let path = PathBuf::from("store.bin");

    let _ = with_store(app_handle.to_owned(), stores, path, |store| {
        store.entries().for_each(|sfd| {
            let pure_value: &serde_json::Value = sfd.1;
            let fd: Result<FlatDep, _> = serde_json::from_value(pure_value.clone());
            match fd {
                Ok(fd) => in_memory_store.add_single(fd),
                Err(err) => println!("could not convert {}", err),
            };
        });
        Ok(())
    });

    println!("deps stored");
    Ok(())
}

pub fn main() {
    tauri::Builder::default()
        .manage(store::in_memory_store::ModelStore::default())
        .manage(github::remote::Github::new())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let store =
                tauri_plugin_store::StoreBuilder::new("store.bin").build(app.handle().clone());
            let _ = tauri_plugin_store::Builder::default().store(store);
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        // Initialize the plugin
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            load_into_store,
            load_from_store,
            load_from_github,
            load_from_local,
            load_into_local
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

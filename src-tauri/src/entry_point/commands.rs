use std::env;
use std::path::PathBuf;

use crate::dep_core::DepError;
use crate::dep_core::FlatDep;

use crate::github;
use crate::renovate;
use crate::store;

use serde_json::json;

use tauri::Manager;
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::with_store;

#[tauri::command]
pub fn load_from_store(filter: &str, store: State<store::in_memory_store::ModelStore>) -> String {
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
pub fn load_licenses_from_store(
    filter: &str,
    store: State<store::in_memory_store::ModelStore>,
) -> String {
    let res: Result<Vec<FlatDep>, DepError> = if filter.is_empty() {
        Ok(store.all())
    } else {
        Ok(store::filter::filter_deps_on_licenses(filter, store.all()))
    };

    match res {
        Ok(res) => serde_json::to_string_pretty(&res).unwrap(),
        Err(e) => format!("{:#?}", e),
    }
}

#[tauri::command]
pub fn load_into_store(name: &str, store: State<store::in_memory_store::ModelStore>) {
    println!("trying to get deps from file: {:#?}", name);
    let res = renovate::loader::load_flat_from_file(name);
    match res {
        Ok(res) => store.add(res),
        Err(e) => println!("{:#?}", e),
    }
}

#[tauri::command]
pub fn load_gh_token() -> String {
    let Ok(personal_token) = env::var("GITHUB_TOKEN") else {
        return "notoken".to_string();
    };

    personal_token
}

#[tauri::command]
pub async fn load_from_github(
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
pub async fn delete_local(app_handle: tauri::AppHandle) -> Result<(), ()> {
    let stores = app_handle.state::<tauri_plugin_store::StoreCollection<Wry>>();
    let path = PathBuf::from("store.bin");

    let _ = with_store(app_handle.to_owned(), stores, path, |store| {
        store.clear()?;
        Ok(())
    });
    println!("deps deleted from local");
    Ok(())
}

#[tauri::command]
pub async fn delete_local_and_memory_dep(
    app_handle: tauri::AppHandle,
    in_memory_store: State<'_, store::in_memory_store::ModelStore>,
    dep_id: String,
) -> Result<(), ()> {
    if let Ok(as_uuid) = dep_id.parse::<uuid::Uuid>() {
        in_memory_store.delete(as_uuid);

        let stores = app_handle.state::<tauri_plugin_store::StoreCollection<Wry>>();
        let path = PathBuf::from("store.bin");

        let _ = with_store(app_handle.to_owned(), stores, path, |store| {
            store.delete(dep_id)?;
            Ok(())
        });

        println!("deps deleted from local");
    } else {
        println!("could not parse UUID");
    };

    Ok(())
}

#[tauri::command]
pub async fn delete_memory(
    in_memory_store: State<'_, store::in_memory_store::ModelStore>,
) -> Result<(), ()> {
    in_memory_store.clear_all();
    println!("in memory deps cleared");
    Ok(())
}

#[tauri::command]
pub async fn load_into_local(
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
pub async fn load_from_local(
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

    println!("deps loaded");
    Ok(())
}

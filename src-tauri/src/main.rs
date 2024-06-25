// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod dep_core;
mod entry_point;
mod github;
mod renovate;
mod store;

pub fn main() {
    entry_point::start_app()
}

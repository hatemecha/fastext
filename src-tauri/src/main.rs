#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! FasText - Editor de texto minimalista y de alto rendimiento
//! Aplicación de escritorio construida con Tauri y Rust

mod commands;
mod constants;
mod dialog;
mod file_ops;

use tauri::Manager;
use commands::file_commands::{open_file, save_file_direct, save_file_as, rename_file, show_confirm_dialog};
use commands::updater_commands::{check_update, install_update};
use commands::app_commands::get_app_version;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_title("FasText").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file_direct,
            save_file_as,
            rename_file,
            show_confirm_dialog,
            check_update,
            install_update,
            get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::path::PathBuf;
use std::sync::mpsc;
use tauri::api::dialog::FileDialogBuilder;
use crate::constants::{TEXT_FILE_EXTENSIONS, FILTER_TEXT_FILES, FILTER_ALL_FILES};

pub fn show_open_dialog() -> Result<Option<PathBuf>, String> {
    let (tx, rx) = mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter(FILTER_TEXT_FILES, TEXT_FILE_EXTENSIONS)
        .add_filter(FILTER_ALL_FILES, &["*"])
        .pick_file(move |path_buf| {
            let _ = tx.send(path_buf);
        });
    
    rx.recv()
        .map_err(|_| "Error al recibir la respuesta del diálogo".to_string())
}

pub fn show_save_dialog(default_filename: Option<&str>) -> Result<Option<PathBuf>, String> {
    let (tx, rx) = mpsc::channel();
    
    let mut builder = FileDialogBuilder::new()
        .add_filter(FILTER_TEXT_FILES, TEXT_FILE_EXTENSIONS)
        .add_filter(FILTER_ALL_FILES, &["*"]);
    
    if let Some(filename) = default_filename {
        builder = builder.set_file_name(filename);
    }
    
    builder.save_file(move |path_buf| {
        let _ = tx.send(path_buf);
    });
    
    rx.recv()
        .map_err(|_| "Error al recibir la respuesta del diálogo".to_string())
}








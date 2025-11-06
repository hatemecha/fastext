use std::path::PathBuf;
use std::sync::mpsc;
use crate::dialog;
use crate::file_ops;
use tauri::api::dialog::MessageDialogBuilder;

#[tauri::command]
pub fn open_file() -> Result<serde_json::Value, String> {
    let file_path = dialog::show_open_dialog()?;
    
    match file_path {
        Some(path) => {
            let content = file_ops::read_file(&path)?;
            let path_str = path.to_string_lossy().to_string();
            Ok(serde_json::json!({
                "content": content,
                "path": path_str
            }))
        },
        None => Err("No se seleccionó ningún archivo".to_string()),
    }
}

#[tauri::command]
pub fn save_file_direct(path: String, content: String) -> Result<String, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("La ruta no puede estar vacía".to_string());
    }
    
    let path_buf = PathBuf::from(trimmed);
    
    if let Some(parent) = path_buf.parent() {
        if !parent.exists() {
            return Err(format!("El directorio padre no existe: {:?}", parent));
        }
    }
    
    file_ops::write_file(&path_buf, &content)?;
    Ok(path_buf.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_file_as(content: String, default_path: Option<String>) -> Result<String, String> {
    let default_filename = default_path.as_ref().and_then(|s| {
        let trimmed = s.trim();
        if trimmed.is_empty() {
            None
        } else {
            PathBuf::from(trimmed)
                .file_name()
                .and_then(|n| n.to_str())
                .map(|s| s.to_string())
        }
    });
    
    let file_path = dialog::show_save_dialog(default_filename.as_deref())?;
    
    match file_path {
        Some(path) => {
            file_ops::write_file(&path, &content)?;
            Ok(path.to_string_lossy().to_string())
        }
        None => Err("No se seleccionó ningún archivo".to_string()),
    }
}

#[tauri::command]
pub fn rename_file(old_path: String, new_filename: String) -> Result<String, String> {
    let old_path_buf = PathBuf::from(&old_path);
    
    let parent = old_path_buf.parent()
        .ok_or_else(|| "No se pudo obtener el directorio padre".to_string())?;
    
    let new_path = parent.join(&new_filename);
    
    if new_path.exists() {
        return Err("Ya existe un archivo con ese nombre".to_string());
    }
    
    file_ops::rename_file(&old_path_buf, &new_path)?;
    
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn show_confirm_dialog(message: String, title: String) -> Result<bool, String> {
    let (tx, rx) = mpsc::channel();
    
    MessageDialogBuilder::new(&title, &message)
        .show(move |response| {
            let _ = tx.send(response);
        });
    
    rx.recv()
        .map(|response| response)
        .map_err(|_| "Error al recibir la respuesta del diálogo".to_string())
}



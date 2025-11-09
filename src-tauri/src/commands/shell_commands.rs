//! Comandos relacionados con integraciones del sistema operativo
//! Encapsulan acciones específicas para acceder a recursos externos

use tauri::Manager;

/// Abre una URL en el navegador predeterminado del sistema
#[tauri::command]
pub fn open_url_in_browser(app: tauri::AppHandle, url: String) -> Result<(), String> {
    if url.trim().is_empty() {
        return Err(String::from("URL vacía"))
    }

    tauri::api::shell::open(&app.shell_scope(), url, None).map_err(|err| err.to_string())
}



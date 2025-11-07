#[tauri::command]
pub async fn check_update(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let updater = app.updater();
    match updater.check().await {
        Ok(update_response) => {
            if update_response.is_update_available() {
                let date_str = update_response.date()
                    .map(|d| d.to_string())
                    .unwrap_or_else(|| String::from(""));
                let body_str = update_response.body().map(|s| s.clone()).unwrap_or_else(|| String::from(""));
                Ok(serde_json::json!({
                    "available": true,
                    "version": update_response.latest_version(),
                    "date": date_str,
                    "body": body_str
                }))
            } else {
                Ok(serde_json::json!({
                    "available": false
                }))
            }
        }
        Err(e) => Err(format!("Error al verificar actualizaciones: {}", e))
    }
}

#[tauri::command]
pub async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater();
    match updater.check().await {
        Ok(update_response) => {
            if update_response.is_update_available() {
                update_response.download_and_install().await
                    .map_err(|e| format!("Error al descargar e instalar: {}", e))?;
                Ok(())
            } else {
                Err("No hay actualización disponible".to_string())
            }
        }
        Err(e) => Err(format!("Error al verificar actualizaciones: {}", e))
    }
}


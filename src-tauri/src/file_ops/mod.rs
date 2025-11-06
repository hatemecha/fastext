//! Módulo para operaciones de lectura y escritura de archivos
//! Incluye validaciones de tamaño y manejo optimizado de archivos grandes

use std::fs;
use std::io::{Read, Write};
use std::path::Path;

const MAX_FILE_SIZE: u64 = 100 * 1024 * 1024; // 100MB

/// Lee un archivo de texto completo
/// Valida el tamaño del archivo antes de leerlo para evitar problemas de memoria
pub fn read_file<P: AsRef<Path>>(path: P) -> Result<String, String> {
    let path = path.as_ref();
    
    let metadata = fs::metadata(path)
        .map_err(|e| format!("Error al leer los metadatos del archivo: {}", e))?;
    
    if metadata.len() > MAX_FILE_SIZE {
        return Err(format!("El archivo es demasiado grande (máximo {}MB)", MAX_FILE_SIZE / 1024 / 1024));
    }
    
    let mut file = fs::File::open(path)
        .map_err(|e| format!("Error al abrir el archivo: {}", e))?;
    
    let mut buffer = String::with_capacity(metadata.len() as usize + 1024);
    file.read_to_string(&mut buffer)
        .map_err(|e| format!("Error al leer el archivo: {}", e))?;
    
    Ok(buffer)
}

/// Escribe contenido a un archivo
/// Crea el directorio padre si no existe y sincroniza el archivo al disco
pub fn write_file<P: AsRef<Path>>(path: P, content: &str) -> Result<(), String> {
    let path = path.as_ref();
    
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Error al crear el directorio: {}", e))?;
        }
    }
    
    let mut file = fs::File::create(path)
        .map_err(|e| format!("Error al crear el archivo: {}", e))?;
    
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Error al escribir el archivo: {}", e))?;
    
    file.sync_all()
        .map_err(|e| format!("Error al sincronizar el archivo: {}", e))?;
    
    Ok(())
}

/// Renombra un archivo moviéndolo de una ruta a otra
pub fn rename_file<P: AsRef<Path>>(old_path: P, new_path: P) -> Result<(), String> {
    fs::rename(old_path, new_path)
        .map_err(|e| format!("Error al renombrar el archivo: {}", e))
}




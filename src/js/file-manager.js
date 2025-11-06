export class FileManager {
    constructor() {
        this.currentFilePath = null
        this.loadSavedPath()
    }

    loadSavedPath() {
        const savedPath = localStorage.getItem('fastext-path')
        if (savedPath) {
            this.currentFilePath = savedPath
        }
    }

    savePath(path) {
        this.currentFilePath = path
        if (path) {
            localStorage.setItem('fastext-path', path)
        } else {
            localStorage.removeItem('fastext-path')
        }
    }

    async openFile() {
        if (!window.__TAURI_INVOKE__) {
            throw new Error('Tauri no está disponible')
        }
        
        const result = await window.__TAURI_INVOKE__('open_file')
        
        if (result.path) {
            this.currentFilePath = result.path
            this.savePath(result.path)
        }
        
        return result
    }

    async save(content, filePath) {
        if (!window.__TAURI_INVOKE__) {
            throw new Error('Tauri no está disponible')
        }
        
        if (!filePath || filePath.trim() === '') {
            throw new Error('Ruta de archivo no válida')
        }
        
        const savedPath = await window.__TAURI_INVOKE__('save_file_direct', {
            path: filePath,
            content: content
        })
        
        this.savePath(savedPath)
        return savedPath
    }

    async saveAs(content, defaultPath = null) {
        if (!window.__TAURI_INVOKE__) {
            throw new Error('Tauri no está disponible')
        }
        
        const filePath = await window.__TAURI_INVOKE__('save_file_as', {
            content: content,
            default_path: defaultPath || null
        })
        
        this.savePath(filePath)
        return filePath
    }

    getCurrentPath() {
        return this.currentFilePath
    }

    async renameFile(oldPath, newFilename) {
        if (!window.__TAURI_INVOKE__) {
            throw new Error('Tauri no está disponible')
        }
        
        const newPath = await window.__TAURI_INVOKE__('rename_file', {
            old_path: oldPath,
            new_filename: newFilename
        })
        
        this.savePath(newPath)
        return newPath
    }
}




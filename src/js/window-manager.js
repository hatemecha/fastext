export class WindowManager {
    updateTitle(filePath) {
        try {
            if (!window.__TAURI__ || !window.__TAURI__.window) {
                return
            }
            const { appWindow } = window.__TAURI__.window
            if (filePath) {
                const fileName = filePath.split(/[/\\]/).pop() || 'Sin título'
                appWindow.setTitle(`FasText - ${fileName}`)
            } else {
                appWindow.setTitle('FasText')
            }
        } catch (e) {
            // Silenciar errores de título
        }
    }
}




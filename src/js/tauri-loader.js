export async function loadTauriAPI() {
    try {
        const { invoke } = await import('@tauri-apps/api/tauri')
        window.__TAURI_INVOKE__ = invoke
        return invoke
    } catch (error) {
        console.error('Error al importar Tauri API:', error)
        throw error
    }
}

export async function waitForTauri() {
    if (window.__TAURI_INVOKE__) {
        return
    }
    
    try {
        await loadTauriAPI()
    } catch (error) {
        console.error('Error al cargar Tauri API:', error)
    }
}




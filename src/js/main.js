import { waitForTauri } from './tauri-loader.js'
import { Editor } from './editor.js'
import { FileManager } from './file-manager.js'
import { WindowManager } from './window-manager.js'
import { TabManager } from './tab-manager.js'
import { SettingsManager } from './settings-manager.js'
import { ConfigManager } from './config-manager.js'
import { showMessage } from './dialog-helper.js'
import { ThemeManager } from './theme-manager.js'
import { StatusBar } from './status-bar.js'
import { MarkdownPreview } from './markdown-preview.js'

class App {
    constructor() {
        this.editor = null
        this.fileManager = new FileManager()
        this.windowManager = new WindowManager()
        this.tabManager = null
        this.settingsManager = new SettingsManager()
        this.themeManager = new ThemeManager()
        this.configManager = new ConfigManager(this.settingsManager)
        this.statusBar = null
        this.autosaveTimer = null
        this.shortcutHandler = null
        this.markdownPreview = null
    }

    async init() {
        await waitForTauri()
        
        this.themeManager.applyTheme(this.settingsManager.getTheme())
        this.applyFontSettings()
        
        const editorElement = document.getElementById('editor')
        if (!editorElement) {
            console.error('No se encontró el editor')
            return
        }
        
        this.editor = new Editor(editorElement)
        this.tabManager = new TabManager(editorElement, this.fileManager, this.settingsManager)
        this.statusBar = new StatusBar(editorElement, this.tabManager)
        this.markdownPreview = new MarkdownPreview(editorElement, this.tabManager)

        if (this.markdownPreview) {
            const originalUpdateTabFromFile = this.tabManager.updateTabFromFile.bind(this.tabManager)
            this.tabManager.updateTabFromFile = async (...args) => {
                const result = await originalUpdateTabFromFile(...args)
                requestAnimationFrame(() => {
                    this.markdownPreview.handleExternalContentChange()
                })
                return result
            }
        }
        
        this.setupButtons()
        this.setupKeyboardShortcuts()
        this.setupTabEvents()
        this.setupAutosave()
        this.setupSmartAutosave()
        
        const currentPath = this.fileManager.getCurrentPath()
        if (currentPath) {
            this.windowManager.updateTitle(currentPath)
        }

        document.addEventListener('config-saved', () => {
            this.setupKeyboardShortcuts()
            this.applyFontSettings()
            this.themeManager.applyTheme(this.settingsManager.getTheme())
        })
    }

    setupTabEvents() {
        document.addEventListener('save-tab', async (e) => {
            const tabId = e.detail.tabId
            const tab = e.detail.tab || this.tabManager.tabs.find(t => t.id === tabId)
            if (tab) {
                const wasActive = this.tabManager.activeTabId === tabId
                if (!wasActive) {
                    this.tabManager.setActiveTab(tabId)
                    await new Promise(resolve => requestAnimationFrame(resolve))
                }
                await this.handleSave()
            }
        })

        document.addEventListener('tab-renamed', (e) => {
            const { tabId, newPath } = e.detail
            const activeTab = this.tabManager.getActiveTab()
            if (activeTab && activeTab.id === tabId) {
                this.windowManager.updateTitle(newPath)
            }
            if (this.statusBar) {
                this.statusBar.update()
            }
        })

        // Actualizar barra de estado cuando cambia la pestaña activa
        // Interceptar el método setActiveTab para actualizar la barra de estado
        const originalSetActiveTab = this.tabManager.setActiveTab.bind(this.tabManager)
        this.tabManager.setActiveTab = (tabId) => {
            originalSetActiveTab(tabId)
            requestAnimationFrame(() => {
                if (this.statusBar) {
                    this.statusBar.update()
                }
            })
        }
    }

    setupButtons() {
        const newBtn = document.getElementById('newBtn')
        const openBtn = document.getElementById('openBtn')
        const saveBtn = document.getElementById('saveBtn')
        const autosaveBtn = document.getElementById('autosaveBtn')
        
        if (newBtn) {
            newBtn.addEventListener('click', () => this.handleNew())
        }
        
        if (openBtn) {
            openBtn.addEventListener('click', () => this.handleOpen())
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave())
        }
        
        if (autosaveBtn) {
            this.updateAutosaveButton()
            autosaveBtn.addEventListener('click', () => this.toggleAutosave())
        }

        const configBtn = document.getElementById('configBtn')
        if (configBtn) {
            configBtn.addEventListener('click', () => this.configManager.show())
        }
    }

    setupKeyboardShortcuts() {
        if (this.shortcutHandler) {
            document.removeEventListener('keydown', this.shortcutHandler)
        }

        this.shortcutHandler = (e) => {
            if (document.body.getAttribute('data-config-open') === 'true') {
                return
            }

            const shortcuts = this.settingsManager.getShortcuts()
            
            const checkShortcut = (action) => {
                const shortcut = shortcuts[action]
                if (!shortcut) return false
                
                const ctrlMatch = (shortcut.ctrl || shortcut.meta) ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
                const altMatch = shortcut.alt ? e.altKey : !e.altKey
                const keyMatch = shortcut.key === e.key || 
                                (shortcut.key === 'Tab' && e.key === 'Tab')
                
                return ctrlMatch && shiftMatch && altMatch && keyMatch
            }

            if (checkShortcut('open')) {
                e.preventDefault()
                this.handleOpen()
            } else if (checkShortcut('saveAs')) {
                e.preventDefault()
                this.handleSaveAs()
            } else if (checkShortcut('save')) {
                e.preventDefault()
                this.handleSave()
            } else if (checkShortcut('new')) {
                e.preventDefault()
                this.handleNew()
            }
        }

        document.addEventListener('keydown', this.shortcutHandler)
    }

    applyFontSettings() {
        const editor = document.getElementById('editor')
        const toolbar = document.getElementById('toolbar')
        const fontFamily = this.settingsManager.getFontFamily()
        const fontSize = this.settingsManager.getFontSize()

        const formattedFont = this.formatFontFamily(fontFamily)

        if (editor) {
            editor.style.fontFamily = formattedFont
            editor.style.fontSize = fontSize + 'px'
        }

        if (toolbar) {
            toolbar.style.fontFamily = formattedFont
        }

        document.documentElement.style.setProperty('--editor-font-family', formattedFont)
        document.documentElement.style.setProperty('--editor-font-size', fontSize + 'px')
    }

    formatFontFamily(fontFamily) {
        if (!fontFamily) return 'monospace'
        return `'${fontFamily}', monospace`
    }

    handleNew() {
        const tab = this.tabManager.createTab('unnamed')
        this.tabManager.setActiveTab(tab.id)
        if (this.statusBar) {
            requestAnimationFrame(() => this.statusBar.update())
        }
    }

    async handleOpen() {
        try {
            const result = await this.fileManager.openFile()
            const content = result.content || result
            const filePath = result.path || this.fileManager.getCurrentPath()
            const fileName = this.tabManager.getFileName(filePath)
            
            const tab = this.tabManager.createTab(fileName, filePath, content)
            this.tabManager.setActiveTab(tab.id)
            this.windowManager.updateTitle(filePath)
            if (this.statusBar) {
                requestAnimationFrame(() => this.statusBar.update())
            }
        } catch (error) {
            if (error.message !== 'No se seleccionó ningún archivo' && 
                error !== 'No se seleccionó ningún archivo') {
                showMessage('Error al abrir el archivo: ' + error, 'Error')
            }
        }
    }

    async handleSave() {
        try {
            const activeTab = this.tabManager.getActiveTab()
            if (!activeTab) return

            this.tabManager.saveCurrentTabContent()
            const content = this.editor.getContent()
            
            let currentPath = activeTab.filePath
            if (currentPath && typeof currentPath === 'string') {
                currentPath = currentPath.trim()
                if (currentPath === '' || currentPath === 'unnamed') {
                    currentPath = null
                }
            } else {
                currentPath = null
            }
            
            if (!currentPath) {
                return await this.handleSaveAs()
            }
            
            const filePath = await this.fileManager.save(content, currentPath)
            
            if (filePath) {
                await this.tabManager.updateTabFromFile(activeTab.id, filePath, content)
                this.windowManager.updateTitle(filePath)
            }
        } catch (error) {
            if (error.message !== 'No se seleccionó ningún archivo' && 
                error !== 'No se seleccionó ningún archivo') {
                showMessage('Error al guardar el archivo: ' + error, 'Error')
            }
        }
    }

    async handleSaveAs() {
        try {
            const activeTab = this.tabManager.getActiveTab()
            if (!activeTab) return

            this.tabManager.saveCurrentTabContent()
            const content = this.editor.getContent()
            
            const defaultPath = activeTab.filePath && activeTab.filePath.trim() !== '' 
                ? activeTab.filePath 
                : null
            
            const filePath = await this.fileManager.saveAs(content, defaultPath)
            
            if (filePath) {
                await this.tabManager.updateTabFromFile(activeTab.id, filePath, content)
                this.windowManager.updateTitle(filePath)
            }
        } catch (error) {
            if (error.message !== 'No se seleccionó ningún archivo' && 
                error !== 'No se seleccionó ningún archivo') {
                showMessage('Error al guardar el archivo: ' + error, 'Error')
            }
        }
    }

    setupAutosave() {
        if (this.settingsManager.isAutosaveEnabled()) {
            this.startAutosave()
        }
    }

    startAutosave() {
        this.stopAutosave()
        const interval = this.settingsManager.getAutosaveInterval()
        this.autosaveTimer = setInterval(() => {
            const activeTab = this.tabManager.getActiveTab()
            if (activeTab && activeTab.filePath) {
                this.handleSave()
            }
        }, interval)
    }

    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer)
            this.autosaveTimer = null
        }
    }

    toggleAutosave() {
        const enabled = !this.settingsManager.isAutosaveEnabled()
        this.settingsManager.setAutosave(enabled)
        
        if (enabled) {
            this.startAutosave()
        } else {
            this.stopAutosave()
        }
        
        this.updateAutosaveButton()
    }

    updateAutosaveButton() {
        const autosaveBtn = document.getElementById('autosaveBtn')
        if (autosaveBtn) {
            if (this.settingsManager.isAutosaveEnabled()) {
                autosaveBtn.classList.add('active')
                autosaveBtn.textContent = 'Autoguardado: on'
                autosaveBtn.title = 'Autoguardado activado (clic para desactivar)'
            } else {
                autosaveBtn.classList.remove('active')
                autosaveBtn.textContent = 'Autoguardado: off'
                autosaveBtn.title = 'Autoguardado desactivado (clic para activar)'
            }
        }
    }

    setupSmartAutosave() {
        if (!this.settingsManager.isSmartAutosaveEnabled()) {
            return
        }

        const editorElement = document.getElementById('editor')
        if (!editorElement) return

        let debounceTimer = null
        editorElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (debounceTimer) {
                    clearTimeout(debounceTimer)
                }
                debounceTimer = setTimeout(() => {
                    const activeTab = this.tabManager.getActiveTab()
                    if (activeTab && activeTab.filePath) {
                        this.handleSave()
                    }
                }, 500)
            }
        })
    }
}

const app = new App()

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init())
} else {
    app.init()
}


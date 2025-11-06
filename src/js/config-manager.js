import { SettingsManager } from './settings-manager.js'
import { showConfirm, showMessage } from './dialog-helper.js'
import { ThemeManager } from './theme-manager.js'

export class ConfigManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager
        this.themeManager = new ThemeManager()
        this.overlay = null
        this.editingShortcut = null
        this.setupModal()
    }

    setupModal() {
        const overlay = document.createElement('div')
        overlay.id = 'config-overlay'
        overlay.className = 'config-overlay'
        overlay.innerHTML = `
            <div class="config-container">
                <div class="config-header">
                    <h2 class="config-title">Configuración</h2>
                    <button id="config-close" class="config-close">×</button>
                </div>
                <div class="config-body">
                    <div class="config-section">
                        <h3 class="config-section-title">Atajos de Teclado</h3>
                        <div id="shortcuts-list" class="shortcuts-list"></div>
                    </div>
                    <div class="config-section">
                        <h3 class="config-section-title">Aparencia</h3>
                        <div class="config-field">
                            <label for="theme">Tema:</label>
                            <select id="theme" class="config-input">
                            </select>
                        </div>
                        <div class="config-field">
                            <label for="font-family">Fuente:</label>
                            <select id="font-family" class="config-input">
                                <option value="Consolas">Consolas</option>
                                <option value="Fira Code">Fira Code</option>
                                <option value="Source Code Pro">Source Code Pro</option>
                                <option value="JetBrains Mono">JetBrains Mono</option>
                                <option value="MesloLGS NF">MesloLGS NF</option>
                            </select>
                        </div>
                        <div class="config-field">
                            <label for="font-size">Tamaño de letra:</label>
                            <input type="number" id="font-size" class="config-input" min="8" max="48" step="1">
                        </div>
                    </div>
                    <div class="config-section">
                        <h3 class="config-section-title">Información</h3>
                        <div class="config-info">
                            <p><strong>Versión:</strong> <span id="app-version">0.1.0</span></p>
                            <p><strong>Autor:</strong> Gabriel Romero</p>
                        </div>
                    </div>
                </div>
                <div class="config-footer">
                    <button id="config-reset" class="config-btn config-btn-secondary">Restaurar predeterminados</button>
                    <button id="config-save" class="config-btn config-btn-primary">Guardar</button>
                </div>
            </div>
        `
        document.body.appendChild(overlay)
        this.overlay = overlay
        this.setupEventListeners()
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('config-close')
        const saveBtn = document.getElementById('config-save')
        const resetBtn = document.getElementById('config-reset')
        const theme = document.getElementById('theme')
        const fontFamily = document.getElementById('font-family')
        const fontSize = document.getElementById('font-size')

        closeBtn.addEventListener('click', () => this.hide())
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide()
            }
        })

        saveBtn.addEventListener('click', () => this.saveConfig())
        resetBtn.addEventListener('click', () => this.resetConfig())

        let themeUpdateTimeout = null
        const applyTheme = () => {
            if (theme.value) {
                this.settingsManager.setTheme(theme.value)
                this.themeManager.applyTheme(theme.value)
            }
        }

        theme.addEventListener('change', applyTheme)
        theme.addEventListener('input', () => {
            if (themeUpdateTimeout) clearTimeout(themeUpdateTimeout)
            themeUpdateTimeout = setTimeout(applyTheme, 100)
        })

        let fontFamilyUpdateTimeout = null
        const applyFontFamily = () => {
            if (fontFamily.value) {
                this.settingsManager.setFontFamily(fontFamily.value)
                this.applyFontSettings()
            }
        }

        fontFamily.addEventListener('change', applyFontFamily)
        fontFamily.addEventListener('input', () => {
            if (fontFamilyUpdateTimeout) clearTimeout(fontFamilyUpdateTimeout)
            fontFamilyUpdateTimeout = setTimeout(applyFontFamily, 100)
        })

        const applyFontSize = () => {
            const size = parseInt(fontSize.value)
            if (!isNaN(size) && size >= 8 && size <= 48) {
                this.settingsManager.setFontSize(size)
                this.applyFontSettings()
            }
        }

        let fontSizeUpdateTimeout = null
        const debouncedApplyFontSize = () => {
            if (fontSizeUpdateTimeout) clearTimeout(fontSizeUpdateTimeout)
            fontSizeUpdateTimeout = setTimeout(applyFontSize, 50)
        }

        fontSize.addEventListener('change', applyFontSize)
        fontSize.addEventListener('input', debouncedApplyFontSize)
        fontSize.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                applyFontSize()
            }
        })

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.hide()
            }
        })
    }

    show() {
        this.loadConfig()
        this.renderShortcuts()
        this.overlay.classList.add('show')
        document.body.setAttribute('data-config-open', 'true')
    }

    hide() {
        this.overlay.classList.remove('show')
        this.editingShortcut = null
        document.body.removeAttribute('data-config-open')
    }

    loadConfig() {
        const theme = document.getElementById('theme')
        const fontFamily = document.getElementById('font-family')
        const fontSize = document.getElementById('font-size')
        const version = document.getElementById('app-version')

        if (theme) {
            theme.innerHTML = ''
            const themes = this.themeManager.getAllThemes()
            themes.forEach(t => {
                const option = document.createElement('option')
                option.value = t.id
                option.textContent = t.name
                theme.appendChild(option)
            })
            theme.value = this.settingsManager.getTheme()
        }

        if (fontFamily) {
            fontFamily.value = this.settingsManager.getFontFamily()
        }
        if (fontSize) {
            fontSize.value = this.settingsManager.getFontSize()
        }

        if (version) {
            version.textContent = '1.0.0'
        }
    }

    renderShortcuts() {
        const shortcutsList = document.getElementById('shortcuts-list')
        shortcutsList.innerHTML = ''

        const shortcuts = this.settingsManager.getShortcuts()
        const labels = {
            open: 'Abrir archivo',
            save: 'Guardar',
            saveAs: 'Guardar como',
            new: 'Nuevo archivo',
            searchTab: 'Buscar pestaña',
            switchTab: 'Cambiar pestaña',
            rename: 'Renombrar archivo'
        }

        // Detectar conflictos
        const conflicts = this.detectConflicts(shortcuts)

        for (const [action, shortcut] of Object.entries(shortcuts)) {
            const item = document.createElement('div')
            item.className = 'shortcut-item'
            if (this.editingShortcut === action) {
                item.classList.add('editing')
            }
            if (conflicts.has(action)) {
                item.classList.add('conflict')
            }

            const label = document.createElement('span')
            label.className = 'shortcut-label'
            label.textContent = labels[action] || action

            const display = document.createElement('div')
            display.className = 'shortcut-display'
            display.textContent = this.formatShortcut(shortcut)

            const editBtn = document.createElement('button')
            editBtn.className = 'shortcut-edit-btn'
            editBtn.textContent = this.editingShortcut === action ? 'Grabando...' : 'Editar'
            editBtn.addEventListener('click', () => this.startEditingShortcut(action, display))

            item.appendChild(label)
            item.appendChild(display)
            item.appendChild(editBtn)
            shortcutsList.appendChild(item)
        }
    }

    detectConflicts(shortcuts) {
        const conflicts = new Set()
        const shortcutEntries = Object.entries(shortcuts)
        
        for (let i = 0; i < shortcutEntries.length; i++) {
            const [action1, shortcut1] = shortcutEntries[i]
            for (let j = i + 1; j < shortcutEntries.length; j++) {
                const [action2, shortcut2] = shortcutEntries[j]
                if (this.settingsManager.shortcutsMatch(shortcut1, shortcut2)) {
                    conflicts.add(action1)
                    conflicts.add(action2)
                }
            }
        }
        
        return conflicts
    }

    formatShortcut(shortcut) {
        const parts = []
        if (shortcut.ctrl || shortcut.meta) parts.push('Ctrl')
        if (shortcut.shift) parts.push('Shift')
        if (shortcut.alt) parts.push('Alt')
        if (shortcut.key) {
            const key = shortcut.key === 'Tab' ? 'Tab' : shortcut.key.toUpperCase()
            parts.push(key)
        }
        return parts.join(' + ') || 'Sin atajo'
    }

    startEditingShortcut(action, displayElement) {
        if (this.editingShortcut === action) {
            this.editingShortcut = null
            this.renderShortcuts()
            return
        }

        this.editingShortcut = action
        displayElement.textContent = 'Presiona las teclas...'

        let handler = null
        handler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handler)
                this.editingShortcut = null
                this.renderShortcuts()
                return
            }

            if (e.key === 'Control' || e.key === 'Shift' || 
                e.key === 'Alt' || e.key === 'Meta') {
                return
            }

            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && 
                e.key !== 'F1' && e.key !== 'F2' && e.key !== 'F3' && 
                e.key !== 'F4' && e.key !== 'F5' && e.key !== 'F6' && 
                e.key !== 'F7' && e.key !== 'F8' && e.key !== 'F9' && 
                e.key !== 'F10' && e.key !== 'F11' && e.key !== 'F12') {
                return
            }

            e.preventDefault()
            e.stopPropagation()

            const shortcut = {
                ctrl: e.ctrlKey || e.metaKey,
                shift: e.shiftKey,
                alt: e.altKey,
                key: e.key
            }

            document.removeEventListener('keydown', handler)

            const validation = this.settingsManager.validateShortcut(shortcut, action)
            if (!validation.valid) {
                const conflictLabel = {
                    open: 'Abrir archivo',
                    save: 'Guardar',
                    saveAs: 'Guardar como',
                    new: 'Nuevo archivo',
                    searchTab: 'Buscar pestaña',
                    switchTab: 'Cambiar pestaña',
                    rename: 'Renombrar archivo'
                }[validation.conflict] || validation.conflict

                // No guardar el atajo en conflicto
                this.editingShortcut = null
                this.renderShortcuts()
                
                setTimeout(async () => {
                    await showMessage(`Este atajo ya está asignado a: ${conflictLabel}`, 'Conflicto de atajo')
                }, 100)
                return
            }

            this.settingsManager.setShortcut(action, shortcut)
            this.editingShortcut = null
            this.renderShortcuts()
        }

        document.addEventListener('keydown', handler)
        this.renderShortcuts()
    }

    saveConfig() {
        // Validar que no haya conflictos antes de guardar
        const shortcuts = this.settingsManager.getShortcuts()
        const conflicts = this.detectConflicts(shortcuts)
        
        if (conflicts.size > 0) {
            const conflictLabels = {
                open: 'Abrir archivo',
                save: 'Guardar',
                saveAs: 'Guardar como',
                new: 'Nuevo archivo',
                searchTab: 'Buscar pestaña',
                switchTab: 'Cambiar pestaña',
                rename: 'Renombrar archivo'
            }
            
            const conflictNames = Array.from(conflicts)
                .map(action => conflictLabels[action] || action)
                .join(', ')
            
            showMessage(
                `No se puede guardar la configuración. Hay atajos en conflicto: ${conflictNames}. Por favor, corrige los conflictos antes de guardar.`,
                'Error al guardar'
            )
            return
        }
        
        this.hide()
        this.applyFontSettings()
        document.dispatchEvent(new CustomEvent('config-saved'))
    }

    async resetConfig() {
        const confirmed = await showConfirm('¿Restaurar todas las configuraciones a sus valores predeterminados?', 'Restaurar configuración')
        if (confirmed) {
            this.settingsManager.settings = { ...this.settingsManager.defaultSettings }
            this.settingsManager.saveSettings()
            this.loadConfig()
            this.renderShortcuts()
            this.applyFontSettings()
            this.themeManager.applyTheme(this.settingsManager.getTheme())
            document.dispatchEvent(new CustomEvent('config-saved'))
        }
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
}


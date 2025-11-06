export class SettingsManager {
    constructor() {
        this.defaultSettings = {
            autosave: false,
            autosaveInterval: 30000,
            smartAutosave: true,
            shortcuts: {
                open: { ctrl: true, key: 'o' },
                save: { ctrl: true, key: 's' },
                saveAs: { ctrl: true, shift: true, key: 's' },
                new: { ctrl: true, key: 'n' },
                searchTab: { ctrl: true, key: 'p' },
                switchTab: { ctrl: true, key: 'Tab' },
                rename: { key: 'F2' }
            },
            fontFamily: 'Consolas',
            fontSize: 14,
            theme: 'default'
        }
        this.loadSettings()
    }

    loadSettings() {
        const saved = localStorage.getItem('fastext-settings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                this.settings = { ...this.defaultSettings, ...parsed }
            } catch (e) {
                this.settings = { ...this.defaultSettings }
            }
        } else {
            this.settings = { ...this.defaultSettings }
        }
    }

    saveSettings() {
        localStorage.setItem('fastext-settings', JSON.stringify(this.settings))
    }

    get(key) {
        return this.settings[key]
    }

    set(key, value) {
        this.settings[key] = value
        this.saveSettings()
    }

    isAutosaveEnabled() {
        return this.settings.autosave === true
    }

    getAutosaveInterval() {
        return this.settings.autosaveInterval || 30000
    }

    setAutosave(enabled) {
        this.set('autosave', enabled)
    }

    setAutosaveInterval(interval) {
        this.set('autosaveInterval', interval)
    }

    isSmartAutosaveEnabled() {
        return this.settings.smartAutosave !== false
    }

    setSmartAutosave(enabled) {
        this.set('smartAutosave', enabled)
    }

    getShortcuts() {
        return this.settings.shortcuts || this.defaultSettings.shortcuts
    }

    setShortcut(action, shortcut) {
        if (!this.settings.shortcuts) {
            this.settings.shortcuts = { ...this.defaultSettings.shortcuts }
        }
        this.settings.shortcuts[action] = shortcut
        this.saveSettings()
    }

    getFontFamily() {
        return this.settings.fontFamily || this.defaultSettings.fontFamily
    }

    setFontFamily(fontFamily) {
        this.set('fontFamily', fontFamily)
    }

    getFontSize() {
        return this.settings.fontSize || this.defaultSettings.fontSize
    }

    setFontSize(fontSize) {
        this.set('fontSize', fontSize)
    }

    validateShortcut(shortcut, excludeAction = null) {
        const shortcuts = this.getShortcuts()
        for (const [action, existingShortcut] of Object.entries(shortcuts)) {
            if (excludeAction && action === excludeAction) continue
            if (this.shortcutsMatch(shortcut, existingShortcut)) {
                return { valid: false, conflict: action }
            }
        }
        return { valid: true }
    }

    shortcutsMatch(shortcut1, shortcut2) {
        const normalize = (s) => ({
            ctrl: s.ctrl || false,
            shift: s.shift || false,
            alt: s.alt || false,
            key: s.key?.toLowerCase()
        })
        const s1 = normalize(shortcut1)
        const s2 = normalize(shortcut2)
        return s1.ctrl === s2.ctrl &&
               s1.shift === s2.shift &&
               s1.alt === s2.alt &&
               s1.key === s2.key
    }

    getTheme() {
        return this.settings.theme || this.defaultSettings.theme
    }

    setTheme(theme) {
        this.set('theme', theme)
    }
}

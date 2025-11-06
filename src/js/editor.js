export class Editor {
    constructor(element) {
        this.element = element
        this.saveTimeout = null
        this.lastSavedValue = ''
        this.setupAutoSave()
    }

    setupAutoSave() {
        const saveToLocalStorage = () => {
            const currentValue = this.element.value
            if (currentValue !== this.lastSavedValue) {
                try {
                    localStorage.setItem('fastext-content', currentValue)
                    this.lastSavedValue = currentValue
                } catch (e) {
                    // Ignorar errores de quota exceeded
                }
            }
        }

        this.element.addEventListener('input', () => {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout)
            }
            this.saveTimeout = setTimeout(saveToLocalStorage, 1000)
        })

        window.addEventListener('beforeunload', () => {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout)
            }
            saveToLocalStorage()
        })
    }

    saveToLocalStorage() {
        const currentValue = this.element.value
        if (currentValue !== this.lastSavedValue) {
            try {
                localStorage.setItem('fastext-content', currentValue)
                this.lastSavedValue = currentValue
            } catch (e) {
                // Ignorar errores de quota exceeded
            }
        }
    }

    loadFromLocalStorage() {
        const savedContent = localStorage.getItem('fastext-content')
        if (savedContent) {
            this.element.value = savedContent
        }
    }

    setContent(content) {
        this.element.value = content
        this.lastSavedValue = content
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
        }
        this.saveToLocalStorage()
    }

    getContent() {
        return this.element.value
    }

    clear() {
        this.element.value = ''
        this.lastSavedValue = ''
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
        }
        this.saveToLocalStorage()
    }
}


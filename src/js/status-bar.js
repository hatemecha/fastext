/**
 * Módulo para gestionar la barra de estado inferior
 * Muestra: Línea/Columna, Cantidad de caracteres, Formato de texto, Ruta del archivo
 */
export class StatusBar {
    constructor(editorElement, tabManager) {
        this.editorElement = editorElement
        this.tabManager = tabManager
        this.lineColElement = document.getElementById('status-line-col')
        this.charCountElement = document.getElementById('status-char-count')
        this.formatElement = document.getElementById('status-format')
        this.pathElement = document.getElementById('status-path')
        this.updateTimeout = null
        this.lastCharCount = 0
        this.lastCursorPos = 0
        this.lastFormat = ''
        this.lastPath = ''
        
        this.setupEventListeners()
        this.update()
    }

    /**
     * Configura los event listeners para actualizar la barra de estado
     */
    setupEventListeners() {
        // Usar throttle para eventos frecuentes
        const throttledUpdate = () => {
            if (this.updateTimeout) {
                return
            }
            this.updateTimeout = requestAnimationFrame(() => {
                this.update()
                this.updateTimeout = null
            })
        }
        
        // Actualizar al escribir
        this.editorElement.addEventListener('input', throttledUpdate)
        
        // Actualizar al mover cursor (keyup es más eficiente que keydown)
        this.editorElement.addEventListener('keyup', throttledUpdate)
        this.editorElement.addEventListener('click', throttledUpdate)
        this.editorElement.addEventListener('focus', throttledUpdate)
        
        // Actualizar cuando cambia la selección
        document.addEventListener('selectionchange', () => {
            if (document.activeElement === this.editorElement) {
                throttledUpdate()
            }
        }, { passive: true })
        
        // Actualizar cuando cambia la pestaña activa
        document.addEventListener('tab-changed', () => this.update())
    }

    /**
     * Calcula la línea y columna actual del cursor
     */
    getCursorPosition() {
        const text = this.editorElement.value
        const cursorPos = this.editorElement.selectionStart
        
        if (cursorPos === 0) {
            return { line: 1, col: 1 }
        }
        
        let line = 1
        let col = 1
        
        for (let i = 0; i < cursorPos; i++) {
            if (text[i] === '\n') {
                line++
                col = 1
            } else {
                col++
            }
        }
        
        return { line, col }
    }

    /**
     * Obtiene el formato de texto basado en la extensión del archivo
     */
    getTextFormat() {
        const activeTab = this.tabManager ? this.tabManager.getActiveTab() : null
        if (!activeTab || !activeTab.filePath) {
            return 'Texto sin formato'
        }

        const filePath = activeTab.filePath
        const parts = filePath.split('.')
        
        // Si no hay punto o solo hay un punto al inicio (archivo oculto sin extensión)
        if (parts.length < 2) {
            return 'Texto sin formato'
        }
        
        const extension = parts[parts.length - 1].toLowerCase()
        
        const formatMap = {
            'txt': 'Texto plano',
            'md': 'Markdown',
            'json': 'JSON',
            'xml': 'XML',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'jsx': 'React JSX',
            'tsx': 'React TSX',
            'py': 'Python',
            'rs': 'Rust',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'h': 'C Header',
            'hpp': 'C++ Header',
            'cs': 'C#',
            'php': 'PHP',
            'rb': 'Ruby',
            'go': 'Go',
            'sh': 'Shell Script',
            'bat': 'Batch',
            'ps1': 'PowerShell',
            'yml': 'YAML',
            'yaml': 'YAML',
            'toml': 'TOML',
            'ini': 'INI',
            'cfg': 'Config',
            'conf': 'Config',
            'log': 'Log'
        }

        return formatMap[extension] || extension.toUpperCase() || 'Texto sin formato'
    }

    /**
     * Obtiene la ruta del archivo actual
     */
    getFilePath() {
        const activeTab = this.tabManager ? this.tabManager.getActiveTab() : null
        if (!activeTab || !activeTab.filePath) {
            return ''
        }
        return activeTab.filePath
    }

    /**
     * Actualiza toda la información de la barra de estado
     */
    update() {
        const cursorPos = this.editorElement.selectionStart
        const charCount = this.editorElement.value.length
        
        // Actualizar línea y columna solo si cambió la posición del cursor
        if (cursorPos !== this.lastCursorPos) {
            const { line, col } = this.getCursorPosition()
            if (this.lineColElement) {
                this.lineColElement.textContent = `Ln ${line}, Col ${col}`
            }
            this.lastCursorPos = cursorPos
        }

        // Actualizar cantidad de caracteres solo si cambió
        if (charCount !== this.lastCharCount) {
            if (this.charCountElement) {
                this.charCountElement.textContent = `${charCount} caracteres`
            }
            this.lastCharCount = charCount
        }

        // Actualizar formato de texto solo si cambió
        const format = this.getTextFormat()
        if (format !== this.lastFormat) {
            if (this.formatElement) {
                this.formatElement.textContent = format
            }
            this.lastFormat = format
        }

        // Actualizar ruta del archivo solo si cambió
        const filePath = this.getFilePath()
        if (filePath !== this.lastPath) {
            if (this.pathElement) {
                const pathSeparator = this.pathElement.previousElementSibling
                if (filePath) {
                    this.pathElement.textContent = filePath
                    this.pathElement.title = filePath
                    if (pathSeparator && pathSeparator.classList.contains('status-separator')) {
                        pathSeparator.style.display = ''
                    }
                } else {
                    this.pathElement.textContent = ''
                    this.pathElement.title = ''
                    if (pathSeparator && pathSeparator.classList.contains('status-separator')) {
                        pathSeparator.style.display = 'none'
                    }
                }
            }
            this.lastPath = filePath
        }
    }
}


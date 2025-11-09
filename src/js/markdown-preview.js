const SCROLL_THROTTLE = 50
const MODES = {
    OFF: 'off',
    READING: 'reading',
    SIDEBAR: 'sidebar'
}

export class MarkdownPreview {
    constructor(editorElement, tabManager) {
        this.editorElement = editorElement
        this.tabManager = tabManager
        this.wrapperElement = editorElement.parentElement
        this.containerElement = document.getElementById('editor-container') || this.wrapperElement.parentElement
        this.previewElement = this.ensurePreviewElement()
        this.sidebarPanel = null
        this.statusToggle = document.getElementById('status-markdown-toggle')
        this.modeSelector = document.getElementById('markdown-mode-selector')
        
        setTimeout(() => {
            this.sidebarPanel = this.ensureSidebarPanel()
        }, 100)
        
        if (typeof markdownit === 'undefined') {
            console.error('markdown-it no está disponible')
            this.markdown = null
            this.mode = MODES.OFF
            this.isAvailable = false
            return
        }
        
        this.markdown = new markdownit({
            html: false,
            linkify: true,
            typographer: true,
            breaks: true
        })

        this.mode = MODES.OFF
        this.isAvailable = false
        this.lastRenderedSource = ''
        this.scrollTimeout = null
        this.renderRequest = null

        this.bindEvents()
        this.evaluateAvailability()
        this.updateUI()
    }

    ensurePreviewElement() {
        let preview = document.getElementById('markdown-preview')
        if (!preview) {
            preview = document.createElement('div')
            preview.id = 'markdown-preview'
            preview.setAttribute('aria-live', 'polite')
            if (this.wrapperElement) {
                this.wrapperElement.appendChild(preview)
            }
        }
        return preview
    }

    ensureSidebarPanel() {
        let sidebar = document.getElementById('markdown-sidebar')
        if (!sidebar) {
            sidebar = document.createElement('div')
            sidebar.id = 'markdown-sidebar'
            sidebar.className = 'markdown-sidebar'
            
            const previewContainer = document.createElement('div')
            previewContainer.id = 'markdown-sidebar-preview'
            previewContainer.className = 'markdown-sidebar-preview'
            
            const resizer = document.createElement('div')
            resizer.id = 'markdown-sidebar-resizer'
            resizer.className = 'markdown-sidebar-resizer'
            resizer.addEventListener('mousedown', (e) => this.startResize(e))
            
            sidebar.appendChild(previewContainer)
            
            if (this.containerElement) {
                this.containerElement.appendChild(resizer)
                this.containerElement.appendChild(sidebar)
            }
        }
        return sidebar
    }

    startResize(e) {
        e.preventDefault()
        const sidebar = this.sidebarPanel
        if (!sidebar || !sidebar.classList.contains('active')) return
        
        const startX = e.clientX
        const startWidth = sidebar.offsetWidth
        const minWidth = 200
        const maxWidth = window.innerWidth * 0.5
        
        sidebar.style.transition = 'none'
        
        const doResize = (e) => {
            const diff = startX - e.clientX
            let newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + diff))
            sidebar.style.width = newWidth + 'px'
        }
        
        const stopResize = () => {
            document.removeEventListener('mousemove', doResize)
            document.removeEventListener('mouseup', stopResize)
            sidebar.style.transition = ''
        }
        
        document.addEventListener('mousemove', doResize)
        document.addEventListener('mouseup', stopResize)
    }

    bindEvents() {
        this.editorElement.addEventListener('input', () => this.handleEditorInput())
        this.editorElement.addEventListener('scroll', () => this.syncPreviewScroll())

        document.addEventListener('tab-changed', () => this.handleTabChange())
        document.addEventListener('tab-renamed', () => this.handleTabChange())

        if (this.statusToggle) {
            this.statusToggle.addEventListener('click', () => this.cycleMode())
        }

        if (this.modeSelector) {
            this.modeSelector.addEventListener('change', (e) => {
                this.setMode(e.target.value)
            })
        }
    }

    handleEditorInput() {
        this.evaluateAvailability()
        if (this.mode === MODES.OFF) return
        this.scheduleRender()
    }

    handleTabChange() {
        this.evaluateAvailability()
        if (this.mode !== MODES.OFF) {
            this.render(true)
        }
    }

    handleExternalContentChange() {
        this.evaluateAvailability()
        if (this.mode !== MODES.OFF) {
            this.render(true)
        }
    }

    evaluateAvailability() {
        const activeTab = this.tabManager ? this.tabManager.getActiveTab() : null
        const content = this.editorElement.value
        const isMarkdownFile = this.isMarkdownFile(activeTab?.filePath)
        const hasSyntax = this.hasMarkdownSyntax(content)

        const previousState = this.isAvailable
        this.isAvailable = isMarkdownFile || hasSyntax

        if (!this.isAvailable && this.mode !== MODES.OFF) {
            this.setMode(MODES.OFF)
        } else if (!previousState && this.isAvailable) {
            this.updateUI()
        } else if (previousState !== this.isAvailable) {
            this.updateUI()
        }
    }

    isMarkdownFile(path) {
        if (!path || typeof path !== 'string') return false
        const extension = path.split('.').pop()?.toLowerCase()
        return ['md', 'markdown', 'mdown', 'mkd', 'mkdown'].includes(extension)
    }

    hasMarkdownSyntax(content) {
        if (!content || typeof content !== 'string') return false
        const patterns = [
            /^#{1,6}\s.+/m,
            /^\s{0,3}[-*+]\s.+/m,
            /^\s{0,3}\d+\.\s.+/m,
            /```[\s\S]*?```/,
            /`[^`]+`/,
            /\[.+?\]\(.+?\)/,
            /^>{1,3}\s.+/m
        ]
        return patterns.some((regex) => regex.test(content))
    }

    cycleMode() {
        if (!this.isAvailable) return
        
        const modes = [MODES.OFF, MODES.READING, MODES.SIDEBAR]
        const currentIndex = modes.indexOf(this.mode)
        const nextIndex = (currentIndex + 1) % modes.length
        this.setMode(modes[nextIndex])
    }

    setMode(newMode) {
        if (newMode === this.mode) return
        if (!this.isAvailable && newMode !== MODES.OFF) return

        this.mode = newMode

        if (this.wrapperElement) {
            this.wrapperElement.classList.toggle('preview-reading', this.mode === MODES.READING)
            this.wrapperElement.classList.toggle('preview-sidebar', this.mode === MODES.SIDEBAR)
        }

        if (this.sidebarPanel) {
            const wasActive = this.sidebarPanel.classList.contains('active')
            this.sidebarPanel.classList.toggle('active', this.mode === MODES.SIDEBAR)
            
            if (wasActive && this.mode !== MODES.SIDEBAR) {
                this.sidebarPanel.style.width = ''
                this.sidebarPanel.style.minWidth = ''
            }
        }

        const resizer = document.getElementById('markdown-sidebar-resizer')
        if (resizer) {
            resizer.classList.toggle('active', this.mode === MODES.SIDEBAR)
            if (this.mode !== MODES.SIDEBAR) {
                resizer.style.width = ''
            }
        }

        if (this.mode !== MODES.OFF) {
            this.render(true)
            if (this.mode === MODES.READING) {
                this.syncPreviewScroll()
            }
        } else {
            this.previewElement.innerHTML = ''
            const sidebarPreview = document.getElementById('markdown-sidebar-preview')
            if (sidebarPreview) {
                sidebarPreview.innerHTML = ''
            }
        }

        this.updateUI()
    }


    updateUI() {
        if (!this.statusToggle) return

        let text = 'Markdown: off'
        let icon = 'fa-brands fa-markdown'

        if (this.mode === MODES.READING) {
            text = 'Modo lectura'
            icon = 'fa-solid fa-book-open'
        } else if (this.mode === MODES.SIDEBAR) {
            text = 'Vista lateral'
            icon = 'fa-solid fa-columns'
        }

        const iconElement = this.statusToggle.querySelector('i')
        if (iconElement) {
            iconElement.className = icon
        } else {
            const i = document.createElement('i')
            i.className = icon
            const svg = this.statusToggle.querySelector('svg')
            if (svg) {
                svg.replaceWith(i)
            } else {
                this.statusToggle.insertBefore(i, this.statusToggle.firstChild)
            }
        }

        const textElement = document.getElementById('status-markdown-text')
        if (textElement) {
            textElement.textContent = text
        }

        this.statusToggle.setAttribute('aria-pressed', this.mode !== MODES.OFF ? 'true' : 'false')
        this.statusToggle.title = text

        if (this.isAvailable) {
            this.statusToggle.removeAttribute('disabled')
            this.statusToggle.removeAttribute('aria-disabled')
        } else {
            this.statusToggle.setAttribute('disabled', 'true')
            this.statusToggle.setAttribute('aria-disabled', 'true')
        }
    }

    scheduleRender() {
        if (this.renderRequest) {
            cancelAnimationFrame(this.renderRequest)
        }
        this.renderRequest = requestAnimationFrame(() => {
            this.render()
            this.renderRequest = null
        })
    }

    render(force = false) {
        if (this.mode === MODES.OFF || !this.markdown) return
        const source = this.editorElement.value
        if (!force && source === this.lastRenderedSource) return

        this.lastRenderedSource = source
        const rendered = this.markdown.render(source)
        
        if (this.mode === MODES.READING) {
            this.previewElement.innerHTML = rendered
            this.decorateLinks(this.previewElement)
        } else if (this.mode === MODES.SIDEBAR) {
            const sidebarPreview = document.getElementById('markdown-sidebar-preview')
            if (sidebarPreview) {
                sidebarPreview.innerHTML = rendered
                this.decorateLinks(sidebarPreview)
            }
        }
    }

    decorateLinks(container) {
        if (!container) return
        container.querySelectorAll('a').forEach((anchor) => {
            anchor.setAttribute('target', '_blank')
            anchor.setAttribute('rel', 'noopener noreferrer')
        })
    }

    syncPreviewScroll() {
        if (this.mode !== MODES.READING) return
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout)
            this.scrollTimeout = null
        }
        this.scrollTimeout = setTimeout(() => {
            const editor = this.editorElement
            const preview = this.previewElement
            const editorScrollable = editor.scrollHeight - editor.clientHeight
            if (editorScrollable <= 0) return
            const ratio = editor.scrollTop / editorScrollable
            const previewScrollable = preview.scrollHeight - preview.clientHeight
            preview.scrollTop = previewScrollable * ratio
            this.scrollTimeout = null
        }, SCROLL_THROTTLE)
    }
}

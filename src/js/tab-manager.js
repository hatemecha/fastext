import { showConfirm, showMessage } from './dialog-helper.js'

export class TabManager {
    constructor(editorElement, fileManager, settingsManager = null) {
        this.editorElement = editorElement
        this.fileManager = fileManager
        this.settingsManager = settingsManager
        this.tabs = []
        this.activeTabId = null
        this.nextTabId = 1
        this.sortOrder = 'asc'
        this.tabsPanel = null
        this.tabsList = null
        this.isCollapsed = false
        this.toggleBtn = null
        this.toggleIcon = null
        this.shortcutHandler = null
        this.savedWidth = 200
        this.tabElements = new Map()
        this.renderTimeout = null
        this.lastSortedTabs = []
        
        this.init()
    }

    init() {
        this.createTabsPanel()
        this.createInitialTab()
        this.setupEventListeners()
        
        if (this.settingsManager) {
            document.addEventListener('config-saved', () => {
                this.setupEventListeners()
            })
        }
    }

    createTabsPanel() {
        const container = document.querySelector('body')
        const toolbar = document.getElementById('toolbar')
        const editorContainer = document.createElement('div')
        editorContainer.id = 'editor-container'
        editorContainer.style.display = 'flex'
        editorContainer.style.flex = '1'
        editorContainer.style.overflow = 'hidden'

        // Panel de pestañas
        this.tabsPanel = document.createElement('div')
        this.tabsPanel.id = 'tabs-panel'
        this.tabsPanel.className = 'expanded'

        // Botón de colapsar/expandir
        this.toggleBtn = document.createElement('button')
        this.toggleBtn.id = 'toggle-tabs'
        this.toggleBtn.type = 'button'
        this.toggleBtn.addEventListener('click', () => this.togglePanel())
        this.toggleIcon = this.createToggleIcon()
        this.toggleBtn.appendChild(this.toggleIcon)
        this.updateToggleButtonLabels()

        // Controles de ordenamiento
        const sortControls = document.createElement('div')
        sortControls.className = 'sort-controls'
        const sortBtn = document.createElement('span')
        sortBtn.id = 'sort-btn'
        sortBtn.className = 'sort-text'
        sortBtn.innerHTML = 'Ordenar ↑'
        sortBtn.title = 'Ordenar ASC'
        sortBtn.addEventListener('click', () => this.toggleSortOrder())
        sortControls.appendChild(sortBtn)

        // Lista de pestañas
        this.tabsList = document.createElement('div')
        this.tabsList.id = 'tabs-list'

        this.tabsPanel.appendChild(this.toggleBtn)
        this.tabsPanel.appendChild(sortControls)
        this.tabsPanel.appendChild(this.tabsList)

        // Divisor para redimensionar (invisible por defecto, aparece en hover)
        const resizer = document.createElement('div')
        resizer.id = 'tabs-resizer'
        resizer.addEventListener('mousedown', (e) => this.startResize(e))

        // Contenedor del editor
        const editorWrapper = document.createElement('div')
        editorWrapper.id = 'editor-wrapper'
        editorWrapper.style.flex = '1'
        editorWrapper.style.display = 'flex'
        editorWrapper.style.flexDirection = 'column'
        editorWrapper.style.overflow = 'hidden'
        editorWrapper.appendChild(this.editorElement)

        editorContainer.appendChild(this.tabsPanel)
        editorContainer.appendChild(resizer)
        editorContainer.appendChild(editorWrapper)

        // Reorganizar DOM
        this.editorElement.parentNode.removeChild(this.editorElement)
        editorWrapper.appendChild(this.editorElement)
        container.insertBefore(editorContainer, toolbar.nextSibling)
    }

    createInitialTab() {
        const tab = this.createTab('unnamed')
        this.setActiveTab(tab.id)
    }

    createTab(name, filePath = null, content = '') {
        const tab = {
            id: this.nextTabId++,
            name: name,
            filePath: filePath,
            content: content,
            saved: filePath !== null,
            savedContent: filePath ? content : '',
            hasChanges: false
        }

        this.tabs.push(tab)
        this.renderTabs()
        return tab
    }

    setActiveTab(tabId) {
        if (this.activeTabId !== null) {
            this.saveCurrentTabContent()
        }

        const oldActiveId = this.activeTabId
        this.activeTabId = tabId
        const tab = this.tabs.find(t => t.id === tabId)
        if (tab) {
            this.editorElement.value = tab.content
            this.editorElement.focus()
            
            // Solo actualizar los elementos afectados
            if (oldActiveId !== tabId) {
                const oldElement = this.tabElements.get(oldActiveId)
                const newElement = this.tabElements.get(tabId)
                if (oldElement) {
                    oldElement.classList.remove('active')
                }
                if (newElement) {
                    newElement.classList.add('active')
                } else {
                    this.renderTabs()
                }
            }
        }

        document.dispatchEvent(new CustomEvent('tab-changed', { detail: { tabId } }))
    }

    saveCurrentTabContent() {
        if (this.activeTabId !== null) {
            const tab = this.tabs.find(t => t.id === this.activeTabId)
            if (tab) {
                tab.content = this.editorElement.value
                if (tab.content !== '' || tab.filePath !== null) {
                    tab.hasChanges = tab.content !== this.getSavedContent(tab)
                }
            }
        }
    }

    getSavedContent(tab) {
        if (tab.filePath && tab.saved) {
            return tab.savedContent || ''
        }
        return ''
    }

    async closeTab(tabId, skipConfirm = false) {
        const tab = this.tabs.find(t => t.id === tabId)
        if (!tab) return

        if (!skipConfirm) {
            const wasActive = this.activeTabId === tabId
            if (wasActive) {
                this.saveCurrentTabContent()
            }
            
            const savedContent = tab.savedContent || ''
            const currentContent = wasActive ? this.editorElement.value : tab.content
            const hasUnsavedChanges = (tab.hasChanges || (!tab.saved && currentContent.trim() !== '')) && 
                                      currentContent !== savedContent
            
            if (hasUnsavedChanges) {
                const shouldSave = await showConfirm('¿Quieres guardar los cambios antes de cerrar?', 'Guardar cambios')
                if (shouldSave) {
                    if (wasActive) {
                        const saveEvent = new CustomEvent('save-tab', { detail: { tabId } })
                        document.dispatchEvent(saveEvent)
                        await new Promise(resolve => requestAnimationFrame(resolve))
                    } else {
                        const saveEvent = new CustomEvent('save-tab', { detail: { tabId, tab } })
                        document.dispatchEvent(saveEvent)
                        await new Promise(resolve => requestAnimationFrame(resolve))
                        const updatedTab = this.tabs.find(t => t.id === tabId)
                        if (updatedTab && updatedTab.saved) {
                            tab = updatedTab
                        }
                    }
                }
            }

            const shouldClose = await showConfirm('¿Estás seguro de que quieres cerrar esta pestaña?', 'Cerrar pestaña')
            if (!shouldClose) return
        }

        const index = this.tabs.findIndex(t => t.id === tabId)
        this.tabs.splice(index, 1)

        if (this.tabs.length === 0) {
            this.createInitialTab()
        } else if (this.activeTabId === tabId) {
            const newIndex = Math.min(index, this.tabs.length - 1)
            this.setActiveTab(this.tabs[newIndex].id)
        }

        this.renderTabs()
    }

    toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
        const sortBtn = document.getElementById('sort-btn')
        if (sortBtn) {
            sortBtn.textContent = this.sortOrder === 'asc' ? 'Ordenar ↑' : 'Ordenar ↓'
            sortBtn.title = this.sortOrder === 'asc' ? 'Ordenar ASC' : 'Ordenar DESC'
        }
        this.renderTabs()
    }

    togglePanel() {
        if (this.isCollapsed) {
            this.expandPanel()
        } else {
            this.collapsePanel()
        }
    }

    createToggleIcon() {
        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.setAttribute('viewBox', '0 0 320 512')
        svg.classList.add('toggle-tabs-icon')
        const path = document.createElementNS(svgNS, 'path')
        path.setAttribute('d', 'M34.52 239.03 228.69 44.86a24 24 0 0 1 33.94 0l22.63 22.63a24 24 0 0 1 .04 33.9L188.12 256l96.14 96.19a24 24 0 0 1-.04 33.9l-22.63 22.63a24 24 0 0 1-33.94 0L34.52 272.97a24 24 0 0 1 0-33.94Z')
        svg.appendChild(path)
        return svg
    }

    updateToggleButtonLabels() {
        if (!this.toggleBtn) return
        const label = this.isCollapsed ? 'Expandir panel de pestañas' : 'Contraer panel de pestañas'
        this.toggleBtn.title = label
        this.toggleBtn.setAttribute('aria-label', label)
    }

    renderTabs() {
        if (this.renderTimeout) {
            cancelAnimationFrame(this.renderTimeout)
        }
        
        this.renderTimeout = requestAnimationFrame(() => {
            this._doRenderTabs()
            this.renderTimeout = null
        })
    }

    _doRenderTabs() {
        const sortedTabs = [...this.tabs].sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            return this.sortOrder === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA)
        })

        const currentTabIds = new Set(sortedTabs.map(t => t.id))
        
        // Verificar si el orden cambió
        const orderChanged = sortedTabs.length !== this.lastSortedTabs.length ||
            sortedTabs.some((tab, idx) => this.lastSortedTabs[idx]?.id !== tab.id)

        // Si el orden cambió o hay tabs nuevos/eliminados, reconstruir
        if (orderChanged || sortedTabs.length !== this.tabElements.size) {
            const fragment = document.createDocumentFragment()
            const existingElements = new Map()
            
            sortedTabs.forEach((tab, index) => {
                let tabElement = this.tabElements.get(tab.id)
                
                if (!tabElement) {
                    tabElement = this._createTabElement(tab, index)
                    this.tabElements.set(tab.id, tabElement)
                } else {
                    this._updateTabElement(tabElement, tab, index)
                }
                
                existingElements.set(tab.id, tabElement)
                fragment.appendChild(tabElement)
            })
            
            // Eliminar tabs que ya no existen
            for (const [tabId, element] of this.tabElements.entries()) {
                if (!currentTabIds.has(tabId)) {
                    element.remove()
                    this.tabElements.delete(tabId)
                }
            }
            
            this.tabsList.innerHTML = ''
            this.tabsList.appendChild(fragment)
        } else {
            // Solo actualizar elementos existentes
            sortedTabs.forEach((tab, index) => {
                const tabElement = this.tabElements.get(tab.id)
                if (tabElement) {
                    this._updateTabElement(tabElement, tab, index)
                }
            })
        }

        this.lastSortedTabs = sortedTabs
    }

    _createTabElement(tab, index) {
        const tabElement = document.createElement('div')
        tabElement.className = `tab-item ${tab.id === this.activeTabId ? 'active' : ''}`
        tabElement.dataset.tabId = tab.id

        const tabNumber = document.createElement('span')
        tabNumber.className = 'tab-number'
        tabNumber.textContent = index + 1

        const tabName = document.createElement('span')
        tabName.className = 'tab-name'
        tabName.textContent = tab.name
        tabName.dataset.tabId = tab.id
        tabName.style.color = (tab.saved && !tab.hasChanges) ? '#ffffff' : '#ff4444'

        tabName.addEventListener('dblclick', (e) => {
            e.stopPropagation()
            if (tab.filePath) {
                this.startRenamingTab(tab.id, tabName)
            }
        })

        const closeBtn = document.createElement('span')
        closeBtn.className = 'tab-close'
        closeBtn.innerHTML = '×'
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.closeTab(tab.id)
        })

        tabElement.appendChild(tabNumber)
        tabElement.appendChild(tabName)
        tabElement.appendChild(closeBtn)

        tabElement.addEventListener('click', () => this.setActiveTab(tab.id))

        tabElement.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault()
                this.tabsList.scrollTop += e.deltaY
            }
        }, { passive: false })

        tabElement.addEventListener('auxclick', (e) => {
            if (e.button === 1) {
                e.preventDefault()
                this.closeTab(tab.id, true)
            }
        })

        return tabElement
    }

    _updateTabElement(tabElement, tab, index) {
        const tabNumber = tabElement.querySelector('.tab-number')
        const tabName = tabElement.querySelector('.tab-name')
        
        if (tabNumber && tabNumber.textContent !== String(index + 1)) {
            tabNumber.textContent = index + 1
        }
        
        if (tabName) {
            if (tabName.textContent !== tab.name) {
                tabName.textContent = tab.name
            }
            const newColor = (tab.saved && !tab.hasChanges) ? '#ffffff' : '#ff4444'
            if (tabName.style.color !== newColor) {
                tabName.style.color = newColor
            }
        }
        
        const isActive = tab.id === this.activeTabId
        if (isActive && !tabElement.classList.contains('active')) {
            tabElement.classList.add('active')
        } else if (!isActive && tabElement.classList.contains('active')) {
            tabElement.classList.remove('active')
        }
    }

    setupEventListeners() {
        let inputTimeout = null
        this.editorElement.addEventListener('input', () => {
            if (this.activeTabId !== null) {
                const tab = this.tabs.find(t => t.id === this.activeTabId)
                if (tab) {
                    tab.content = this.editorElement.value
                    const savedContent = tab.savedContent || ''
                    const hadChanges = tab.hasChanges
                    tab.hasChanges = tab.content !== savedContent
                    
                    // Solo actualizar si cambió el estado de cambios guardados
                    if (hadChanges !== tab.hasChanges) {
                        if (inputTimeout) {
                            clearTimeout(inputTimeout)
                        }
                        inputTimeout = setTimeout(() => {
                            this.renderTabs()
                        }, 300)
                    }
                }
            }
        })

        if (this.shortcutHandler) {
            document.removeEventListener('keydown', this.shortcutHandler)
        }

        this.shortcutHandler = (e) => {
            if (document.body.getAttribute('data-config-open') === 'true') {
                return
            }

            if (!this.settingsManager) {
                if (e.ctrlKey && e.key === 'Tab') {
                    e.preventDefault()
                    this.switchToNextTab()
                } else if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault()
                    this.showQuickSearch()
                } else if (e.key === 'F2') {
                    e.preventDefault()
                    const activeTab = this.getActiveTab()
                    if (activeTab && activeTab.filePath) {
                        const tabName = document.querySelector(`.tab-name[data-tab-id="${activeTab.id}"]`)
                        if (tabName) {
                            this.startRenamingTab(activeTab.id, tabName)
                        }
                    }
                }
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

            if (checkShortcut('switchTab')) {
                e.preventDefault()
                this.switchToNextTab()
            } else if (checkShortcut('searchTab')) {
                e.preventDefault()
                this.showQuickSearch()
            } else if (checkShortcut('rename')) {
                e.preventDefault()
                const activeTab = this.getActiveTab()
                if (activeTab && activeTab.filePath) {
                    const tabName = document.querySelector(`.tab-name[data-tab-id="${activeTab.id}"]`)
                    if (tabName) {
                        this.startRenamingTab(activeTab.id, tabName)
                    }
                }
            }
        }

        document.addEventListener('keydown', this.shortcutHandler)
    }

    switchToNextTab() {
        if (this.tabs.length <= 1) return

        const sortedTabs = [...this.tabs].sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            return this.sortOrder === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA)
        })

        const currentIndex = sortedTabs.findIndex(t => t.id === this.activeTabId)
        const nextIndex = (currentIndex + 1) % sortedTabs.length
        this.setActiveTab(sortedTabs[nextIndex].id)
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId)
    }

    async updateTabFromFile(tabId, filePath, content) {
        const tab = this.tabs.find(t => t.id === tabId)
        if (tab) {
            const oldName = tab.name
            const oldHasChanges = tab.hasChanges
            
            tab.filePath = filePath
            tab.content = content
            tab.saved = true
            tab.savedContent = content
            tab.hasChanges = false
            tab.name = this.getFileName(filePath)
            
            if (tab.id === this.activeTabId) {
                this.editorElement.value = content
            }
            
            // Solo renderizar si cambió el nombre o el estado de cambios
            if (oldName !== tab.name || oldHasChanges !== tab.hasChanges) {
                this.renderTabs()
            } else {
                // Solo actualizar el elemento existente
                const tabElement = this.tabElements.get(tabId)
                if (tabElement) {
                    const tabName = tabElement.querySelector('.tab-name')
                    if (tabName) {
                        tabName.style.color = '#ffffff'
                    }
                }
            }
        }
    }

    getFileName(filePath) {
        if (!filePath) return 'unnamed'
        const parts = filePath.split(/[/\\]/)
        return parts[parts.length - 1]
    }

    startResize(e) {
        e.preventDefault()
        // Si está colapsado, expandir primero
        if (this.isCollapsed) {
            this.expandPanel()
            requestAnimationFrame(() => {
                this.startResize(e)
            })
            return
        }
        
        const startX = e.clientX
        const startWidth = this.tabsPanel.offsetWidth
        const minWidth = 50
        const maxWidth = window.innerWidth * 0.5
        const collapseThreshold = 80
        
        // Desactivar transiciones durante el redimensionamiento para mejor fluidez
        this.tabsPanel.style.transition = 'none'
        this.isResizing = true

        let rafId = null
        let lastWidth = startWidth

        const doResize = (e) => {
            const diff = e.clientX - startX
            let newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + diff))
            
            // Usar requestAnimationFrame para suavizar las actualizaciones
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
            
            rafId = requestAnimationFrame(() => {
                // Si el nuevo ancho es menor o igual al umbral, colapsar
                if (newWidth <= collapseThreshold && !this.isCollapsed) {
                    this.collapsePanel()
                    this.isResizing = false
                    this.tabsPanel.style.transition = ''
                    return
                }
                
                // Solo actualizar si el ancho cambió significativamente
                if (Math.abs(newWidth - lastWidth) > 0.5) {
                    this.tabsPanel.style.width = newWidth + 'px'
                    lastWidth = newWidth
                }
            })
        }

        const stopResize = () => {
            document.removeEventListener('mousemove', doResize)
            document.removeEventListener('mouseup', stopResize)
            
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
            
            // Restaurar transiciones
            this.tabsPanel.style.transition = ''
            this.isResizing = false
            
            // Guardar el ancho final
            const finalWidth = this.tabsPanel.offsetWidth
            if (finalWidth > 50 && !this.isCollapsed) {
                this.savedWidth = finalWidth
            }
        }

        document.addEventListener('mousemove', doResize)
        document.addEventListener('mouseup', stopResize)
    }

    collapsePanel() {
        if (this.isCollapsed) return
        // Guardar el ancho actual antes de colapsar
        const currentWidth = this.tabsPanel.offsetWidth
        if (currentWidth > 50) {
            this.savedWidth = currentWidth
        }
        this.isCollapsed = true
        this.tabsPanel.classList.add('collapsed')
        // Asegurar que el ancho sea exactamente 50px cuando está colapsado
        this.tabsPanel.style.width = '50px'
        this.updateToggleButtonLabels()
        this.renderTabs()
    }

    expandPanel() {
        if (!this.isCollapsed) return
        this.isCollapsed = false
        this.tabsPanel.classList.remove('collapsed')
        this.updateToggleButtonLabels()
        // Restaurar el ancho guardado o usar el ancho por defecto
        const widthToRestore = this.savedWidth && this.savedWidth > 50 ? this.savedWidth : 200
        this.tabsPanel.style.width = widthToRestore + 'px'
        this.renderTabs()
    }

    showQuickSearch() {
        const overlay = document.getElementById('quick-search')
        const input = document.getElementById('quick-search-input')
        const results = document.getElementById('quick-search-results')
        
        overlay.classList.add('show')
        input.value = ''
        input.focus()
        
        const updateResults = () => {
            const query = input.value.toLowerCase().trim()
            results.innerHTML = ''
            
            if (query === '') {
                this.renderAllTabs(results)
                return
            }
            
            const filteredTabs = this.tabs.filter(tab => 
                tab.name.toLowerCase().includes(query)
            )
            
            if (filteredTabs.length === 0) {
                const noResults = document.createElement('div')
                noResults.className = 'quick-search-no-results'
                noResults.textContent = 'No se encontraron pestañas'
                results.appendChild(noResults)
                return
            }
            
            let selectedIndex = 0
            
            filteredTabs.forEach((tab, index) => {
                const item = document.createElement('div')
                item.className = 'quick-search-item'
                item.dataset.tabId = tab.id
                
                if (tab.id === this.activeTabId && selectedIndex === 0) {
                    item.classList.add('selected')
                    selectedIndex = index
                }
                
                const name = document.createElement('span')
                name.className = 'quick-search-item-name'
                if (tab.saved && !tab.hasChanges) {
                    name.style.color = '#ffffff'
                } else {
                    name.className += ' unsaved'
                }
                name.textContent = tab.name
                
                const active = document.createElement('span')
                if (tab.id === this.activeTabId) {
                    active.className = 'quick-search-item-active'
                    active.textContent = 'Activa'
                }
                
                item.appendChild(name)
                item.appendChild(active)
                
                item.addEventListener('click', () => {
                    this.setActiveTab(tab.id)
                    this.hideQuickSearch()
                })
                
                results.appendChild(item)
            })
            
            if (filteredTabs.length > 0) {
                const items = results.querySelectorAll('.quick-search-item')
                if (items.length > 0 && !results.querySelector('.quick-search-item.selected')) {
                    items[0].classList.add('selected')
                }
            }
        }
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                this.hideQuickSearch()
                return
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                e.stopPropagation()
                this.selectQuickSearchItem(1)
                return
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                e.stopPropagation()
                this.selectQuickSearchItem(-1)
                return
            }
            
            if (e.key === 'Enter') {
                e.preventDefault()
                e.stopPropagation()
                const selected = results.querySelector('.quick-search-item.selected')
                if (selected) {
                    const tabId = parseInt(selected.dataset.tabId)
                    this.setActiveTab(tabId)
                    this.hideQuickSearch()
                }
                return
            }
            
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
                requestAnimationFrame(updateResults)
            }
        }
        
        const handleClickOutside = (e) => {
            if (e.target === overlay) {
                this.hideQuickSearch()
            }
        }
        
        input.addEventListener('input', updateResults)
        input.addEventListener('keydown', handleKeyDown)
        overlay.addEventListener('click', handleClickOutside)
        
        updateResults()
        
        this.quickSearchInput = input
        this.quickSearchResults = results
        this.quickSearchOverlay = overlay
    }
    
    renderAllTabs(results) {
        results.innerHTML = ''
        
        if (this.tabs.length === 0) {
            const noResults = document.createElement('div')
            noResults.className = 'quick-search-no-results'
            noResults.textContent = 'No hay pestañas'
            results.appendChild(noResults)
            return
        }
        
        this.tabs.forEach((tab, index) => {
            const item = document.createElement('div')
            item.className = 'quick-search-item'
            if (tab.id === this.activeTabId) {
                item.classList.add('selected')
            }
            item.dataset.tabId = tab.id
            item.dataset.index = index
            
            const name = document.createElement('span')
            name.className = 'quick-search-item-name'
            if (tab.saved && !tab.hasChanges) {
                name.style.color = '#ffffff'
            } else {
                name.className += ' unsaved'
            }
            name.textContent = tab.name
            
            const active = document.createElement('span')
            if (tab.id === this.activeTabId) {
                active.className = 'quick-search-item-active'
                active.textContent = 'Activa'
            }
            
            item.appendChild(name)
            item.appendChild(active)
            
            item.addEventListener('click', () => {
                this.setActiveTab(tab.id)
                this.hideQuickSearch()
            })
            
            results.appendChild(item)
        })
    }
    
    selectQuickSearchItem(direction) {
        const results = this.quickSearchResults || document.getElementById('quick-search-results')
        if (!results) return
        
        const items = Array.from(results.querySelectorAll('.quick-search-item'))
        if (items.length === 0) return
        
        const current = results.querySelector('.quick-search-item.selected')
        let currentIndex = -1
        
        if (current) {
            currentIndex = items.indexOf(current)
        }
        
        if (direction === 1 || direction === -1) {
            if (currentIndex === -1) {
                currentIndex = 0
            } else {
                currentIndex += direction
                if (currentIndex < 0) currentIndex = items.length - 1
                if (currentIndex >= items.length) currentIndex = 0
            }
        } else {
            currentIndex = direction
        }
        
        items.forEach(item => item.classList.remove('selected'))
        if (items[currentIndex] && currentIndex >= 0 && currentIndex < items.length) {
            items[currentIndex].classList.add('selected')
            items[currentIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }
    
    hideQuickSearch() {
        const overlay = this.quickSearchOverlay || document.getElementById('quick-search')
        if (overlay) {
            overlay.classList.remove('show')
        }
    }

    startRenamingTab(tabId, tabNameElement) {
        const tab = this.tabs.find(t => t.id === tabId)
        if (!tab || !tab.filePath) return

        const input = document.createElement('input')
        input.type = 'text'
        input.value = tab.name
        input.className = 'tab-name-input'
        input.style.cssText = `
            background: #2a2a2a;
            color: #ffffff;
            border: 1px solid #444;
            padding: 2px 4px;
            font-size: inherit;
            font-family: inherit;
            width: 100%;
            outline: none;
            border-radius: 2px;
        `

        const finishRenaming = async () => {
            const newName = input.value.trim()
            if (newName === tab.name || newName === '') {
                tabNameElement.textContent = tab.name
                input.replaceWith(tabNameElement)
                return
            }

            try {
                const newPath = await this.fileManager.renameFile(tab.filePath, newName)
                await this.updateTabFromFile(tabId, newPath, tab.content)
                document.dispatchEvent(new CustomEvent('tab-renamed', { 
                    detail: { tabId, oldPath: tab.filePath, newPath } 
                }))
            } catch (error) {
                showMessage('Error al renombrar el archivo: ' + error, 'Error')
                tabNameElement.textContent = tab.name
                input.replaceWith(tabNameElement)
            }
        }

        input.addEventListener('blur', finishRenaming)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                input.blur()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                tabNameElement.textContent = tab.name
                input.replaceWith(tabNameElement)
            }
        })

        tabNameElement.replaceWith(input)
        input.focus()
        input.select()
    }
}


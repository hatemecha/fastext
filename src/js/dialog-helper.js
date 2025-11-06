export async function showConfirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay')
        const titleElement = document.getElementById('modal-title')
        const messageElement = document.getElementById('modal-message')
        const confirmBtn = document.getElementById('modal-confirm')
        const cancelBtn = document.getElementById('modal-cancel')

        // Si el modal de configuración está abierto, aumentar el z-index
        const configOverlay = document.getElementById('config-overlay')
        if (configOverlay && configOverlay.classList.contains('show')) {
            overlay.classList.add('above-config')
        }

        titleElement.textContent = title
        messageElement.textContent = message

        const closeModal = (result) => {
            overlay.classList.remove('show')
            overlay.classList.remove('above-config')
            resolve(result)
        }

        const handleConfirm = () => {
            closeModal(true)
        }

        const handleCancel = () => {
            closeModal(false)
        }

        confirmBtn.onclick = handleConfirm
        cancelBtn.onclick = handleCancel

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                handleCancel()
            }
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel()
                document.removeEventListener('keydown', handleEscape)
            }
        }

        document.addEventListener('keydown', handleEscape)
        
        overlay.classList.add('show')
        confirmBtn.focus()
    })
}

export async function showMessage(message, title = 'Información') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay')
        const titleElement = document.getElementById('modal-title')
        const messageElement = document.getElementById('modal-message')
        const confirmBtn = document.getElementById('modal-confirm')
        const cancelBtn = document.getElementById('modal-cancel')

        // Si el modal de configuración está abierto, aumentar el z-index
        const configOverlay = document.getElementById('config-overlay')
        if (configOverlay && configOverlay.classList.contains('show')) {
            overlay.classList.add('above-config')
        }

        titleElement.textContent = title
        messageElement.textContent = message
        cancelBtn.style.display = 'none'

        const closeModal = () => {
            overlay.classList.remove('show')
            overlay.classList.remove('above-config')
            cancelBtn.style.display = ''
            resolve()
        }

        const handleConfirm = () => {
            closeModal()
        }

        confirmBtn.textContent = 'Aceptar'
        confirmBtn.onclick = handleConfirm

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closeModal()
            }
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal()
                document.removeEventListener('keydown', handleEscape)
            }
        }

        document.addEventListener('keydown', handleEscape)
        
        overlay.classList.add('show')
        confirmBtn.focus()
    })
}


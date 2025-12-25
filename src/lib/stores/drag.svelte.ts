// Global drag state for API items
const DRAG_THRESHOLD = 5 // pixels before drag starts

class DragStore {
    draggingApiId = $state<string | null>(null)
    hoverTargetId = $state<string | null>(null) // folder id or 'root'
    private dragGhost: HTMLElement | null = null
    private pendingDrag: { apiId: string; element: HTMLElement; startX: number; startY: number } | null = null
    private hasDragStarted = false

    startDrag(apiId: string, sourceElement: HTMLElement, e: MouseEvent) {
        // Store pending drag info - actual drag starts after threshold
        this.pendingDrag = {
            apiId,
            element: sourceElement,
            startX: e.clientX,
            startY: e.clientY
        }
        this.hasDragStarted = false
        window.addEventListener('mousemove', this.handleMouseMove)
    }

    endDrag() {
        this.draggingApiId = null
        this.hoverTargetId = null
        this.pendingDrag = null
        this.hasDragStarted = false
        document.body.classList.remove('is-dragging')
        window.removeEventListener('mousemove', this.handleMouseMove)
        this.removeDragGhost()
    }

    private activateDrag() {
        if (!this.pendingDrag) return

        this.draggingApiId = this.pendingDrag.apiId
        this.hasDragStarted = true
        document.body.classList.add('is-dragging')
        this.createDragGhost(this.pendingDrag.element)
    }

    private createDragGhost(sourceElement: HTMLElement) {
        const ghost = sourceElement.cloneNode(true) as HTMLElement
        const rect = sourceElement.getBoundingClientRect()

        ghost.style.position = 'fixed'
        ghost.style.top = `${rect.top}px`
        ghost.style.left = `${rect.left}px`
        ghost.style.width = `${rect.width}px`
        ghost.style.pointerEvents = 'none'
        ghost.style.zIndex = '9999'
        ghost.style.opacity = '0.85'
        ghost.style.background = 'var(--surface)'
        ghost.style.borderRadius = '6px'
        ghost.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)'
        ghost.style.transform = 'scale(0.95)'
        ghost.style.fontSize = '11px'
        ghost.style.padding = '4px 8px'
        ghost.classList.add('drag-ghost')

        document.body.appendChild(ghost)
        this.dragGhost = ghost
    }

    private removeDragGhost() {
        if (this.dragGhost) {
            this.dragGhost.remove()
            this.dragGhost = null
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        // Check if we should activate the drag (threshold reached)
        if (this.pendingDrag && !this.hasDragStarted) {
            const dx = e.clientX - this.pendingDrag.startX
            const dy = e.clientY - this.pendingDrag.startY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance >= DRAG_THRESHOLD) {
                this.activateDrag()
            } else {
                return // Don't do anything until threshold is reached
            }
        }

        // Update ghost position
        if (this.dragGhost) {
            const ghostRect = this.dragGhost.getBoundingClientRect()
            this.dragGhost.style.top = `${e.clientY - ghostRect.height / 2}px`
            this.dragGhost.style.left = `${e.clientX - ghostRect.width / 2}px`
        }

        // Detect hover target
        const element = document.elementFromPoint(e.clientX, e.clientY)
        if (!element) {
            this.hoverTargetId = null
            return
        }

        // Check if hovering over a folder header
        const folderHeader = element.closest('[data-folder-id]') as HTMLElement
        if (folderHeader) {
            this.hoverTargetId = folderHeader.dataset.folderId || null
            return
        }

        // Check if hovering over root drop zone
        const rootZone = element.closest('[data-drop-zone="root"]')
        if (rootZone) {
            this.hoverTargetId = 'root'
            return
        }

        this.hoverTargetId = null
    }

    get isDragging(): boolean {
        return this.draggingApiId !== null
    }

    isHoveringFolder(folderId: string): boolean {
        return this.isDragging && this.hoverTargetId === folderId
    }

    isHoveringRoot(): boolean {
        return this.isDragging && this.hoverTargetId === 'root'
    }
}

export const dragStore = new DragStore()

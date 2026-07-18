// Global drag state for API items
const DRAG_THRESHOLD = 5 // pixels before drag starts

export type InsertionPoint = {
    groupId: string
    index: number
    lineY: number
    lineLeft: number
    lineWidth: number
}

class DragStore {
    draggingApiId = $state<string | null>(null)
    hoverTargetId = $state<string | null>(null) // folder id or 'root'
    insertionPoint = $state<InsertionPoint | null>(null)
    justDropped = false // set briefly after a drop to suppress the click event
    private dragGhost: HTMLElement | null = null
    private pendingDrag: { apiId: string; element: HTMLElement; startX: number; startY: number } | null = null
    private hasDragStarted = false

    startDrag(apiId: string, sourceElement: HTMLElement, e: MouseEvent) {
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
        const didDrag = this.hasDragStarted
        this.draggingApiId = null
        this.hoverTargetId = null
        this.insertionPoint = null
        this.pendingDrag = null
        this.hasDragStarted = false
        document.body.classList.remove('is-dragging')
        window.removeEventListener('mousemove', this.handleMouseMove)
        this.removeDragGhost()
        if (didDrag) {
            this.justDropped = true
            // Reset on next tick — after the click event would have fired
            setTimeout(() => { this.justDropped = false }, 0)
        }
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
        if (this.pendingDrag && !this.hasDragStarted) {
            const dx = e.clientX - this.pendingDrag.startX
            const dy = e.clientY - this.pendingDrag.startY
            if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
                this.activateDrag()
            } else {
                return
            }
        }

        if (this.dragGhost) {
            const ghostRect = this.dragGhost.getBoundingClientRect()
            this.dragGhost.style.top = `${e.clientY - ghostRect.height / 2}px`
            this.dragGhost.style.left = `${e.clientX - ghostRect.width / 2}px`
        }
    }

    // Called from per-item onmousemove handlers when dragging.
    setHoverOnItem(groupId: string, index: number, rect: DOMRect, clientY: number) {
        if (!this.isDragging) return
        const isAfter = clientY > rect.top + rect.height / 2
        this.insertionPoint = {
            groupId,
            index: isAfter ? index + 1 : index,
            lineY: isAfter ? rect.bottom : rect.top,
            lineLeft: rect.left,
            lineWidth: rect.width,
        }
        this.hoverTargetId = null
    }

    clearItemHover() {
        if (!this.isDragging) return
        this.insertionPoint = null
    }

    setHoverFolder(folderId: string) {
        if (!this.isDragging) return
        this.hoverTargetId = folderId
        this.insertionPoint = null
    }

    setHoverRoot() {
        if (!this.isDragging) return
        this.hoverTargetId = 'root'
    }

    clearHoverTarget(targetId: string) {
        if (this.hoverTargetId === targetId) this.hoverTargetId = null
    }

    get isDragging(): boolean {
        return this.draggingApiId !== null
    }

    isHoveringFolder(folderId: string): boolean {
        return this.isDragging && this.hoverTargetId === folderId
    }

    isHoveringRoot(): boolean {
        return this.isDragging && this.hoverTargetId === 'root' && this.insertionPoint === null
    }
}

export const dragStore = new DragStore()

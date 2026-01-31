import { folderService } from '$lib/services/folder.service'
import { workspaceStore } from '$lib/stores/workspace.svelte'
import type { Folder, FolderNode } from '$lib/types/http'

class FolderStore {
    private allFolders = $state<Folder[]>([])
    expandedIds = $state<Set<string>>(new Set())

    get folders(): Folder[] {
        const workspaceId = workspaceStore.currentWorkspaceId
        if (!workspaceId) return []
        return this.allFolders.filter(f => f.workspace_id === workspaceId)
    }

    // Build tree structure from flat folders list
    get tree(): FolderNode[] {
        const map = new Map<string, FolderNode>()

        // Create nodes for all folders
        for (const folder of this.folders) {
            map.set(folder.id, { ...folder, children: [] })
        }

        const roots: FolderNode[] = []

        // Build parent-child relationships
        for (const folder of this.folders) {
            const node = map.get(folder.id)!
            if (folder.parent_id) {
                const parent = map.get(folder.parent_id)
                if (parent) {
                    parent.children.push(node)
                } else {
                    // Parent not found, treat as root
                    roots.push(node)
                }
            } else {
                roots.push(node)
            }
        }

        return roots
    }

    isExpanded(id: string): boolean {
        return this.expandedIds.has(id)
    }

    toggleExpanded(id: string) {
        const newSet = new Set(this.expandedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        this.expandedIds = newSet
    }

    expand(id: string) {
        if (!this.expandedIds.has(id)) {
            this.expandedIds = new Set(this.expandedIds).add(id)
        }
    }

    collapse(id: string) {
        if (this.expandedIds.has(id)) {
            const newSet = new Set(this.expandedIds)
            newSet.delete(id)
            this.expandedIds = newSet
        }
    }

    async load() {
        this.allFolders = await folderService.listFolders()
    }

    async create(name: string, parentId?: string) {
        const workspaceId = workspaceStore.currentWorkspaceId || undefined
        const folder = await folderService.createFolder(name, parentId, workspaceId)
        if (folder) {
            this.allFolders = [...this.allFolders, folder]
            // Auto-expand parent if creating inside a folder
            if (parentId) {
                this.expand(parentId)
            }
        }
        return folder
    }

    async update(id: string, name?: string, parentId?: string | null) {
        const folder = await folderService.updateFolder(id, name, parentId)
        if (folder) {
            this.allFolders = this.allFolders.map(f => f.id === id ? folder : f)
        }
        return folder
    }

    async delete(id: string) {
        await folderService.deleteFolder(id)
        this.allFolders = this.allFolders.filter(f => f.id !== id)
        // Remove from expanded set
        this.collapse(id)
    }

    async moveApi(apiId: string, folderId?: string) {
        return await folderService.moveApi(apiId, folderId)
    }

    getFolder(id: string): Folder | undefined {
        return this.allFolders.find(f => f.id === id)
    }
}

export const folderStore = new FolderStore()

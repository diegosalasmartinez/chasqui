import type { Workspace } from '$lib/types/http'
import { workspaceService } from '$lib/services/workspace.service'

const CURRENT_WORKSPACE_KEY = 'currentWorkspaceId'

class WorkspaceStore {
    workspaces = $state<Workspace[]>([])
    currentWorkspaceId = $state<string | null>(null)

    get currentWorkspace(): Workspace | null {
        if (!this.currentWorkspaceId) return null
        return this.workspaces.find(w => w.id === this.currentWorkspaceId) ?? null
    }

    async load() {
        this.workspaces = await workspaceService.listWorkspaces()

        // Restore last selected workspace from localStorage
        const savedId = localStorage.getItem(CURRENT_WORKSPACE_KEY)
        if (savedId && this.workspaces.some(w => w.id === savedId)) {
            this.currentWorkspaceId = savedId
        } else if (this.workspaces.length > 0) {
            // Default to first workspace
            this.currentWorkspaceId = this.workspaces[0].id
        }
    }

    selectWorkspace(id: string) {
        if (this.workspaces.some(w => w.id === id)) {
            this.currentWorkspaceId = id
            localStorage.setItem(CURRENT_WORKSPACE_KEY, id)
        }
    }

    async createWorkspace(name: string) {
        const workspace = await workspaceService.createWorkspace(name)
        if (workspace) {
            this.workspaces = [...this.workspaces, workspace]
            this.selectWorkspace(workspace.id)
        }
        return workspace
    }

    async updateWorkspace(id: string, name: string) {
        const updated = await workspaceService.updateWorkspace(id, name)
        if (updated) {
            this.workspaces = this.workspaces.map(w => w.id === id ? updated : w)
        }
        return updated
    }

    async deleteWorkspace(id: string) {
        const success = await workspaceService.deleteWorkspace(id)
        if (success) {
            this.workspaces = this.workspaces.filter(w => w.id !== id)
            // If we deleted the current workspace, switch to first available
            if (this.currentWorkspaceId === id && this.workspaces.length > 0) {
                this.selectWorkspace(this.workspaces[0].id)
            }
        }
        return success
    }
}

export const workspaceStore = new WorkspaceStore()

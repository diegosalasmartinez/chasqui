import { environmentService } from '$lib/services/environment.service'
import { workspaceStore } from '$lib/stores/workspace.svelte'
import type { Environment, EnvVariable } from '$lib/types/http'

class EnvironmentStore {
    private allEnvironments = $state<Environment[]>([])
    selectedId = $state<string | null>(null)
    private saveTimeout: ReturnType<typeof setTimeout> | null = null
    private pendingSave: { id: string; name?: string; variables?: EnvVariable[] } | null = null

    get environments(): Environment[] {
        const workspaceId = workspaceStore.currentWorkspaceId
        if (!workspaceId) return []
        return this.allEnvironments.filter(e => e.workspace_id === workspaceId)
    }

    get selected(): Environment | null {
        if (!this.selectedId) return null
        return this.environments.find(e => e.id === this.selectedId) || null
    }

    // Get variables from selected environment as a Map for easy lookup
    get variablesMap(): Map<string, string> {
        const map = new Map<string, string>()
        if (this.selected) {
            for (const v of this.selected.variables) {
                if (v.key) {
                    map.set(v.key, v.value)
                }
            }
        }
        return map
    }

    async load() {
        this.allEnvironments = await environmentService.list()
    }

    select(id: string | null) {
        this.selectedId = id
    }

    async create(name: string = "New Environment") {
        const workspaceId = workspaceStore.currentWorkspaceId ?? undefined
        const env = await environmentService.create(name, workspaceId)
        if (env) {
            this.allEnvironments = [...this.allEnvironments, env]
        }
        return env
    }

    // Update locally first, then debounce save to server
    updateLocal(id: string, name?: string, variables?: EnvVariable[]) {
        // Update local state immediately
        this.allEnvironments = this.allEnvironments.map(e => {
            if (e.id !== id) return e
            return {
                ...e,
                name: name ?? e.name,
                variables: variables ?? e.variables
            }
        })

        // Debounce the server save
        this.pendingSave = { id, name, variables }

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
        }

        this.saveTimeout = setTimeout(() => {
            this.flushSave()
        }, 500)
    }

    private async flushSave() {
        if (!this.pendingSave) return

        const { id, name, variables } = this.pendingSave
        this.pendingSave = null

        await environmentService.update(id, name, variables)
    }

    async update(id: string, name?: string, variables?: EnvVariable[]) {
        const env = await environmentService.update(id, name, variables)
        if (env) {
            this.allEnvironments = this.allEnvironments.map(e => e.id === id ? env : e)
        }
        return env
    }

    async delete(id: string) {
        await environmentService.delete(id)
        this.allEnvironments = this.allEnvironments.filter(e => e.id !== id)
        if (this.selectedId === id) {
            this.selectedId = null
        }
    }

    getEnvironment(id: string): Environment | undefined {
        return this.allEnvironments.find(e => e.id === id)
    }

    clearSelection() {
        this.selectedId = null
    }
}

export const environmentStore = new EnvironmentStore()

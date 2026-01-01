import { environmentService } from '$lib/services/environment.service'
import type { Environment, EnvVariable } from '$lib/types/http'

class EnvironmentStore {
    environments = $state<Environment[]>([])
    selectedId = $state<string | null>(null)
    private saveTimeout: ReturnType<typeof setTimeout> | null = null
    private pendingSave: { id: string; name?: string; variables?: EnvVariable[] } | null = null

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
        this.environments = await environmentService.list()
    }

    select(id: string | null) {
        this.selectedId = id
    }

    async create(name: string = "New Environment") {
        const env = await environmentService.create(name)
        if (env) {
            this.environments = [...this.environments, env]
        }
        return env
    }

    // Update locally first, then debounce save to server
    updateLocal(id: string, name?: string, variables?: EnvVariable[]) {
        // Update local state immediately
        this.environments = this.environments.map(e => {
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
            this.environments = this.environments.map(e => e.id === id ? env : e)
        }
        return env
    }

    async delete(id: string) {
        await environmentService.delete(id)
        this.environments = this.environments.filter(e => e.id !== id)
        if (this.selectedId === id) {
            this.selectedId = null
        }
    }

    getEnvironment(id: string): Environment | undefined {
        return this.environments.find(e => e.id === id)
    }
}

export const environmentStore = new EnvironmentStore()

import type { EnvVariable } from '$lib/types/http'
import { toastStore } from '$lib/stores/toast.svelte'
import {
    listEnvironmentsBridge,
    createEnvironmentBridge,
    updateEnvironmentBridge,
    deleteEnvironmentBridge
} from '$lib/infra/tauri'

class EnvironmentService {
    async list() {
        try {
            return await listEnvironmentsBridge()
        } catch (err) {
            toastStore.error('Error loading environments: ' + err)
            return []
        }
    }

    async create(name: string, workspaceId?: string) {
        try {
            const env = await createEnvironmentBridge(name, workspaceId)
            return env
        } catch (err) {
            toastStore.error('Error creating environment: ' + err)
        }
    }

    async update(id: string, name?: string, variables?: EnvVariable[]) {
        try {
            const env = await updateEnvironmentBridge(id, name, variables)
            return env
        } catch (err) {
            toastStore.error('Error updating environment: ' + err)
        }
    }

    async delete(id: string) {
        try {
            await deleteEnvironmentBridge(id)
            toastStore.info('Environment deleted')
        } catch (err) {
            toastStore.error('Error deleting environment: ' + err)
        }
    }
}

export const environmentService = new EnvironmentService()

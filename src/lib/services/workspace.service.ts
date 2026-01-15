import type { Workspace } from '$lib/types/http'
import { toastStore } from '$lib/stores/toast.svelte'
import {
    listWorkspacesBridge,
    createWorkspaceBridge,
    updateWorkspaceBridge,
    deleteWorkspaceBridge
} from '$lib/infra/tauri'

class WorkspaceService {
    async listWorkspaces(): Promise<Workspace[]> {
        try {
            return await listWorkspacesBridge()
        } catch (err) {
            toastStore.error('Error loading workspaces: ' + err)
            return []
        }
    }

    async createWorkspace(name: string): Promise<Workspace | undefined> {
        try {
            const workspace = await createWorkspaceBridge(name)
            toastStore.info('Workspace created')
            return workspace
        } catch (err) {
            toastStore.error('Error creating workspace: ' + err)
        }
    }

    async updateWorkspace(id: string, name: string): Promise<Workspace | undefined> {
        try {
            const workspace = await updateWorkspaceBridge(id, name)
            toastStore.info('Workspace updated')
            return workspace
        } catch (err) {
            toastStore.error('Error updating workspace: ' + err)
        }
    }

    async deleteWorkspace(id: string): Promise<boolean> {
        try {
            await deleteWorkspaceBridge(id)
            toastStore.info('Workspace deleted')
            return true
        } catch (err) {
            toastStore.error('Error deleting workspace: ' + err)
            return false
        }
    }
}

export const workspaceService = new WorkspaceService()

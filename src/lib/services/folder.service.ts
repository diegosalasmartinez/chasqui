import { toastStore } from '$lib/stores/toast.svelte'
import {
    listFoldersBridge,
    createFolderBridge,
    updateFolderBridge,
    deleteFolderBridge,
    moveApiBridge,
} from '$lib/infra/tauri'

class FolderService {
    async listFolders() {
        try {
            return await listFoldersBridge()
        } catch (err) {
            toastStore.error('Error loading folders: ' + err)
            return []
        }
    }

    async createFolder(name: string, parentId?: string, workspaceId?: string) {
        try {
            const folder = await createFolderBridge(name, parentId, workspaceId)
            toastStore.info('Folder created')
            return folder
        } catch (err) {
            toastStore.error('Error creating folder: ' + err)
        }
    }

    async updateFolder(id: string, name?: string, parentId?: string | null) {
        try {
            const folder = await updateFolderBridge(id, name, parentId)
            toastStore.info('Folder updated')
            return folder
        } catch (err) {
            toastStore.error('Error updating folder: ' + err)
        }
    }

    async deleteFolder(id: string) {
        try {
            await deleteFolderBridge(id)
            toastStore.info('Folder deleted')
        } catch (err) {
            toastStore.error('Error deleting folder: ' + err)
        }
    }

    async moveApi(apiId: string, folderId?: string) {
        try {
            const api = await moveApiBridge(apiId, folderId)
            return api
        } catch (err) {
            toastStore.error('Error moving API: ' + err)
        }
    }
}

export const folderService = new FolderService()

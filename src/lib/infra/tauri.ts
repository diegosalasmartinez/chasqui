import { invoke } from '@tauri-apps/api/core'
import type { Request, Api, ResponseRaw, Folder } from '$lib/types/http'

// API bridges
export async function listApisBridge(): Promise<Api[]> {
    return await invoke('list_apis') as Api[]
}

export async function createApiBridge(name: string, request: Request, folderId?: string): Promise<Api> {
    return await invoke('create_api', { name, request, folderId }) as Api
}

export async function updateApiBridge(id: string, name: string, request: Request): Promise<Api> {
    return await invoke('save_api', { id, name, request }) as Api
}

export async function deleteApiBridge(id: string): Promise<void> {
    return await invoke('delete_api', { id })
}

export async function moveApiBridge(id: string, folderId?: string): Promise<Api> {
    // Try camelCase - Tauri might convert to snake_case for Rust
    const payload = { id, folderId }
    return await invoke('move_api', payload) as Api
}

export async function sendRequestBridge(request: Request): Promise<ResponseRaw> {
    return await invoke('send_request', { request }) as ResponseRaw
}

// Folder bridges
export async function listFoldersBridge(): Promise<Folder[]> {
    return await invoke('list_folders') as Folder[]
}

export async function createFolderBridge(name: string, parent_id?: string): Promise<Folder> {
    return await invoke('create_folder', { name, parent_id }) as Folder
}

export async function updateFolderBridge(id: string, name?: string, parent_id?: string | null): Promise<Folder> {
    return await invoke('update_folder', { id, name, parent_id }) as Folder
}

export async function deleteFolderBridge(id: string): Promise<void> {
    return await invoke('delete_folder', { id })
}


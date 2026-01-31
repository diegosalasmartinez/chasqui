import { invoke } from '@tauri-apps/api/core'
import type { Request, Api, Folder, Environment, EnvVariable, HistoryEntryRaw, SendRequestResult, Workspace } from '$lib/types/http'

// API bridges
export async function listApisBridge(): Promise<Api[]> {
    return await invoke('list_apis') as Api[]
}

export async function createApiBridge(name: string, request: Request, folderId?: string, workspaceId?: string): Promise<Api> {
    return await invoke('create_api', { name, request, folderId, workspaceId }) as Api
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

export async function sendRequestBridge(request: Request, workspaceId?: string): Promise<SendRequestResult> {
    return await invoke('send_request', { request, workspaceId }) as SendRequestResult
}

// Folder bridges
export async function listFoldersBridge(): Promise<Folder[]> {
    return await invoke('list_folders') as Folder[]
}

export async function createFolderBridge(name: string, parentId?: string, workspaceId?: string): Promise<Folder> {
    return await invoke('create_folder', { name, parentId, workspaceId }) as Folder
}

export async function updateFolderBridge(id: string, name?: string, parentId?: string | null): Promise<Folder> {
    return await invoke('update_folder', { id, name, parentId }) as Folder
}

export async function deleteFolderBridge(id: string): Promise<void> {
    return await invoke('delete_folder', { id })
}

// Environment bridges
export async function listEnvironmentsBridge(): Promise<Environment[]> {
    return await invoke('list_environments') as Environment[]
}

export async function createEnvironmentBridge(name: string, workspaceId?: string): Promise<Environment> {
    return await invoke('create_environment', { name, workspaceId }) as Environment
}

export async function updateEnvironmentBridge(id: string, name?: string, variables?: EnvVariable[]): Promise<Environment> {
    return await invoke('update_environment', { id, name, variables }) as Environment
}

export async function deleteEnvironmentBridge(id: string): Promise<void> {
    return await invoke('delete_environment', { id })
}

// History bridges
export async function listHistoryBridge(): Promise<HistoryEntryRaw[]> {
    return await invoke('list_history') as HistoryEntryRaw[]
}

export async function clearHistoryBridge(): Promise<void> {
    return await invoke('clear_history')
}

// Workspace bridges
export async function listWorkspacesBridge(): Promise<Workspace[]> {
    return await invoke('list_workspaces') as Workspace[]
}

export async function createWorkspaceBridge(name: string): Promise<Workspace> {
    return await invoke('create_workspace', { name }) as Workspace
}

export async function updateWorkspaceBridge(id: string, name: string): Promise<Workspace> {
    return await invoke('update_workspace', { id, name }) as Workspace
}

export async function deleteWorkspaceBridge(id: string): Promise<void> {
    return await invoke('delete_workspace', { id })
}

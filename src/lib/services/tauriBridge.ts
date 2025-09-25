import { invoke } from '@tauri-apps/api/core'
import type { Request, Response, Api } from '$lib/types/http'

export async function listApisBridge(): Promise<Api[]> {
    return await invoke('list_apis') as Api[]
}

export async function createApiBridge(name: string, request: Request): Promise<Api> {
    return await invoke('create_api', { name, request }) as Api
}

export async function updateApiBridge(id: string, name: string, request: Request): Promise<Api> {
    return await invoke('save_api', { id, name, request }) as Api
}

export async function deleteApiBridge(id: string) {
    return await invoke('delete_api', { id }) as any
}

export async function sendRequestBridge(request: Request): Promise<Response> {
    return await invoke('send_request', { request }) as Response
}


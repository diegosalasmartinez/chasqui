import { invoke } from '@tauri-apps/api/core'
import type { Request, Response } from '$lib/types/http'

export async function sendRequest(input: Request): Promise<Response> {
    return await invoke('send_request', { input }) as Response
}

export async function listCollections() {
    return await invoke('list_collections') as any
}

export async function addCollection(name: string) {
    return await invoke('add_collection', { name })
}

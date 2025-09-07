import { writable } from 'svelte/store'
import type { Request, Response, HeaderKV } from '$lib/types/http'

export const request = writable<Request>({
    method: 'GET',
    url: 'https://httpbin.org/get',
    headers: [],
    insecure: false,
})

export const response = writable<Response | null>(null)

export function setHeader(i: number, kv: HeaderKV) {
    request.update(r => {
        const headers = [...(r.headers || [])]
        headers[i] = kv
        return { ...r, headers }
    })
}

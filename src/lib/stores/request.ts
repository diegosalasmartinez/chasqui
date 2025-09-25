import { writable, derived, get } from 'svelte/store'
import type { Request, Response, HeaderKV, Api } from '$lib/types/http'

const initialRequest: Request = {
    method: 'GET',
    url: 'https://httpbin.org/get',
    headers: [],
    insecure: false,
}

export const savedApis = writable<Api[]>([]);
export const currentApi = writable<Api | null>(null)

const draftRequest = writable<Request>({ ...initialRequest })

// Use request from api, otherwise use the draft
export const request = derived([currentApi, draftRequest], ([$currentApi, $draft]) =>
    $currentApi?.request ?? $draft
)

export const response = writable<Response | null>(null)

// Update request from api or draft
export function updateRequest(mutator: (r: Request) => Request) {
    const api = get(currentApi)
    if (api) {
        currentApi.set({ ...api, request: mutator(api.request ?? { ...initialRequest }) })
    } else {
        draftRequest.update(r => mutator(r ?? { ...initialRequest }))
    }
}

export function setHeader(i: number, kv: HeaderKV) {
    updateRequest(r => {
        const headers = [...(r.headers ?? [])]
        headers[i] = kv
        return { ...r, headers }
    })
}

export function addApi(newApi: Api) {
    savedApis.update(arr => [...arr, newApi])
}

export function replaceApi(api: Api) {
    savedApis.update(arr => {
        const currentApi = [...arr].map(e => {
            if (e.id === api.id) return api
            return e
        })
        return currentApi
    })
}

export function removeApi(api: Api) {
    savedApis.update(arr => {
        const currentApi = [...arr]
        return currentApi.filter(e => e.id !== api.id)
    })
}

export function selectNewRequest() {
    currentApi.set({
        name: 'New request',
        request: { ...initialRequest }
    })
    response.set(null)
}

export function setCurrentApiName(name: string) {
    const api = get(currentApi)
    if (api) currentApi.set({ ...api, name })
}

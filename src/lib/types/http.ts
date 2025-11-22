export type HeaderKV = { key: string; value: string }

export type Request = {
    method: HttpMethod
    url: string
    headers: HeaderKV[]
    body?: string
    timeout_ms?: number
    insecure: boolean
}

export type Response = {
    status: number
    headers: HeaderKV[]
    body: Uint8Array | number[]
    duration_ms: number
    size_bytes: number
}

export type HistoryItem = {
    at_ms: number
    request: Request
    response: Response
}

export type Api = {
    id?: string
    name: string
    request: Request
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

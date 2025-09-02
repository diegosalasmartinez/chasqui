export type HeaderKV = { key: string; value: string }

export type Request = {
    method: string
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

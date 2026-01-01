export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type KeyValuePair = {
    key: string
    value: string
    enabled: boolean
}

export type HeaderKV = KeyValuePair
export type QueryParam = KeyValuePair

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

export type BearerAuth = {
    type: 'bearer'
    token: string
}

export type BasicAuth = {
    type: 'basic'
    username: string
    password: string
}

export type ApiKeyAuth = {
    type: 'api-key'
    key: string
    value: string
    addTo: 'header' | 'query'
}

export type AuthConfig =
    | { type: 'none' }
    | BearerAuth
    | BasicAuth
    | ApiKeyAuth

export type BodyType = 'none' | 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded'

export type RequestBody =
    | { type: 'none' }
    | { type: 'json'; content: string }
    | { type: 'text'; content: string }
    | { type: 'form-data'; data: KeyValuePair[] }
    | { type: 'x-www-form-urlencoded'; data: KeyValuePair[] }

export type Request = {
    method: HttpMethod
    url: string
    params: QueryParam[]
    headers: HeaderKV[]
    auth: AuthConfig
    body: RequestBody
    timeout_ms?: number
    insecure: boolean
}

export type ResponseRaw = {
    status: number
    headers: HeaderKV[]
    body: Uint8Array | number[]
    at_ms: number
    duration_ms: number
    size_bytes: number
}

export type Response = {
    status: number
    headers: HeaderKV[]
    body: string
    at_ms: number
    duration_ms: number
    size_bytes: number
}

export type Folder = {
    id: string
    name: string
    parent_id?: string
}

export type Api = {
    id?: string
    name: string
    folder_id?: string
    request: Request
}

export type HistoryItem = {
    api: Api
    response: Response
}

export type FolderNode = Folder & {
    children: FolderNode[]
}

export type EnvVariable = {
    key: string
    value: string
    initial_value?: string
}

export type Environment = {
    id: string
    name: string
    workspace_id?: string
    variables: EnvVariable[]
}

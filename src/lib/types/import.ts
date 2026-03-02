import type { Request } from './http'

export type ImportedRequest = {
    name: string
    request: Request
}

export type ImportedFolder = {
    name: string
    requests: ImportedRequest[]
    children: ImportedFolder[]
}

export type ImportedCollection = {
    name: string
    folders: ImportedFolder[]
    requests: ImportedRequest[]
}

export type ImportFormat = 'curl' | 'postman' | 'insomnia' | 'unknown'

export type ParseResult =
    | { format: 'curl'; name: string; request: Request }
    | { format: 'postman' | 'insomnia'; collection: ImportedCollection }
    | { format: 'error'; message: string }
    | { format: 'unknown' }

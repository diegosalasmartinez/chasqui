import type { Request, HttpMethod, KeyValuePair, AuthConfig, RequestBody, QueryParam } from '$lib/types/http'
import type { ImportedRequest, ImportedFolder, ImportedCollection, ImportFormat } from '$lib/types/import'
import { METHODS } from '$lib/constants/http.constants'
import { defaultRequest } from './common'

function isJsonLike(s: string): boolean {
    const t = s.trim()
    return (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))
}

// Normalizes a method string to a known HttpMethod, defaulting to GET
function normalizeMethod(m: string): HttpMethod {
    const upper = m.toUpperCase()
    return ((METHODS as readonly string[]).includes(upper) ? upper : 'GET') as HttpMethod
}

// Curl parser
function tokenizeCurl(raw: string): string[] {
    const normalized = raw
        .replace(/\\\r?\n\s*/g, ' ')
        .replace(/\r?\n/g, ' ')
        .trim()

    const tokens: string[] = []
    let i = 0
    while (i < normalized.length) {
        while (i < normalized.length && /\s/.test(normalized[i])) i++
        if (i >= normalized.length) break

        if (normalized[i] === "'") {
            i++
            let val = ''
            while (i < normalized.length && normalized[i] !== "'") val += normalized[i++]
            i++ // closing quote
            tokens.push(val)
        } else if (normalized[i] === '"') {
            i++
            let val = ''
            while (i < normalized.length && normalized[i] !== '"') {
                if (normalized[i] === '\\' && i + 1 < normalized.length) {
                    i++
                    const c = normalized[i]
                    if (c === 'n') val += '\n'
                    else if (c === 't') val += '\t'
                    else val += c
                } else {
                    val += normalized[i]
                }
                i++
            }
            i++ // closing quote
            tokens.push(val)
        } else {
            let val = ''
            while (i < normalized.length && !/\s/.test(normalized[i])) val += normalized[i++]
            tokens.push(val)
        }
    }
    return tokens
}

export function parseCurl(curlString: string): ImportedRequest {
    const tokens = tokenizeCurl(curlString.trim())
    const request = defaultRequest()

    if (tokens[0]?.toLowerCase() === 'curl') tokens.shift()

    const formFields: KeyValuePair[] = []
    let hasBody = false
    let bodyString = ''
    let isFormData = false
    let url = ''
    let methodExplicit = false

    let i = 0
    while (i < tokens.length) {
        const token = tokens[i]

        if (token === '-X' || token === '--request') {
            const m = tokens[++i]
            if (m) { request.method = normalizeMethod(m); methodExplicit = true }
        } else if (token === '-H' || token === '--header') {
            const header = tokens[++i] || ''
            const colonIdx = header.indexOf(':')
            if (colonIdx > 0) {
                const key = header.slice(0, colonIdx).trim()
                const value = header.slice(colonIdx + 1).trim()
                const keyLower = key.toLowerCase()
                if (keyLower === 'authorization') {
                    if (value.toLowerCase().startsWith('bearer ')) {
                        request.auth = { type: 'bearer', token: value.slice(7).trim() }
                    } else if (value.toLowerCase().startsWith('basic ')) {
                        try {
                            const decoded = atob(value.slice(6).trim())
                            const sep = decoded.indexOf(':')
                            if (sep > 0) {
                                request.auth = {
                                    type: 'basic',
                                    username: decoded.slice(0, sep),
                                    password: decoded.slice(sep + 1),
                                }
                            }
                        } catch {
                            request.headers.push({ key, value, enabled: true })
                        }
                    } else {
                        request.headers.push({ key, value, enabled: true })
                    }
                } else {
                    request.headers.push({ key, value, enabled: true })
                }
            }
        } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
            bodyString = tokens[++i] || ''
            hasBody = true
            if (!methodExplicit) request.method = 'POST'
        } else if (token === '-F' || token === '--form') {
            const field = tokens[++i] || ''
            const eqIdx = field.indexOf('=')
            if (eqIdx > 0) {
                formFields.push({ key: field.slice(0, eqIdx), value: field.slice(eqIdx + 1), enabled: true })
            }
            isFormData = true
            if (!methodExplicit) request.method = 'POST'
        } else if (token === '-u' || token === '--user') {
            const userPass = tokens[++i] || ''
            const colonIdx = userPass.indexOf(':')
            if (colonIdx > 0) {
                request.auth = {
                    type: 'basic',
                    username: userPass.slice(0, colonIdx),
                    password: userPass.slice(colonIdx + 1),
                }
            }
        } else if (token === '--insecure' || token === '-k') {
            request.insecure = true
        } else if (
            token === '--compressed' || token === '-s' || token === '--silent' ||
            token === '-L' || token === '--location' || token === '-v' || token === '--verbose'
        ) {
            // ignored flags
        } else if (
            token === '-o' || token === '--output' || token === '--max-time' ||
            token === '--connect-timeout' || token === '-A' || token === '--user-agent' ||
            token === '-e' || token === '--referer' || token === '--proxy'
        ) {
            i++ // skip value
        } else if (!token.startsWith('-')) {
            url = token
        }

        i++
    }

    // Parse URL into base + query params
    try {
        const urlObj = new URL(url)
        request.url = urlObj.origin + urlObj.pathname
        urlObj.searchParams.forEach((value, key) => {
            request.params.push({ key, value, enabled: true })
        })
    } catch {
        request.url = url
    }

    // Build body
    if (isFormData) {
        request.body = { type: 'form-data', data: formFields }
    } else if (hasBody && bodyString) {
        const ctHeader = request.headers.find(h => h.key.toLowerCase() === 'content-type')
        const ct = ctHeader?.value?.toLowerCase() ?? ''

        if (ct.includes('application/json') || isJsonLike(bodyString)) {
            request.headers = request.headers.filter(h => h.key.toLowerCase() !== 'content-type')
            request.body = { type: 'json', content: bodyString }
        } else if (ct.includes('application/x-www-form-urlencoded')) {
            request.headers = request.headers.filter(h => h.key.toLowerCase() !== 'content-type')
            const pairs: KeyValuePair[] = []
            for (const pair of bodyString.split('&')) {
                const eqIdx = pair.indexOf('=')
                if (eqIdx > 0) {
                    pairs.push({
                        key: decodeURIComponent(pair.slice(0, eqIdx)),
                        value: decodeURIComponent(pair.slice(eqIdx + 1)),
                        enabled: true,
                    })
                }
            }
            request.body = { type: 'x-www-form-urlencoded', data: pairs }
        } else {
            if (ct) request.headers = request.headers.filter(h => h.key.toLowerCase() !== 'content-type')
            request.body = { type: 'text', content: bodyString }
        }
    }

    // Derive a name from the URL path
    let name = 'Imported Request'
    try {
        const urlObj = new URL(url)
        const parts = urlObj.pathname.split('/').filter(Boolean)
        if (parts.length > 0) {
            name = `${request.method} /${parts[parts.length - 1]}`
        } else {
            name = `${request.method} ${urlObj.hostname}`
        }
    } catch {
        if (url) name = `${request.method} ${url}`
    }

    return { name, request }
}

// Postman v2.1 parser

function postmanUrlString(url: unknown): string {
    if (typeof url === 'string') return url
    if (url && typeof url === 'object' && 'raw' in url) return (url as { raw: string }).raw || ''
    return ''
}

function postmanUrlParams(url: unknown): QueryParam[] {
    if (!url || typeof url !== 'object') return []
    const u = url as { query?: Array<{ key: string; value: string; disabled?: boolean }> }
    return (u.query || []).map(q => ({ key: q.key || '', value: q.value || '', enabled: !q.disabled }))
}

function postmanAuth(auth: unknown): AuthConfig {
    if (!auth || typeof auth !== 'object') return { type: 'none' }
    const a = auth as {
        type?: string
        bearer?: Array<{ key: string; value: string }>
        basic?: Array<{ key: string; value: string }>
        apikey?: Array<{ key: string; value: string }>
    }
    if (a.type === 'bearer' && a.bearer) {
        return { type: 'bearer', token: a.bearer.find(e => e.key === 'token')?.value || '' }
    }
    if (a.type === 'basic' && a.basic) {
        return {
            type: 'basic',
            username: a.basic.find(e => e.key === 'username')?.value || '',
            password: a.basic.find(e => e.key === 'password')?.value || '',
        }
    }
    if (a.type === 'apikey' && a.apikey) {
        return {
            type: 'api-key',
            key: a.apikey.find(e => e.key === 'key')?.value || '',
            value: a.apikey.find(e => e.key === 'value')?.value || '',
            addTo: a.apikey.find(e => e.key === 'in')?.value === 'query' ? 'query' : 'header',
        }
    }
    return { type: 'none' }
}

function postmanBody(body: unknown): RequestBody {
    if (!body || typeof body !== 'object') return { type: 'none' }
    const b = body as {
        mode?: string
        raw?: string
        options?: { raw?: { language?: string } }
        urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>
        formdata?: Array<{ key: string; value: string; disabled?: boolean }>
    }
    if (b.mode === 'raw' && b.raw !== undefined) {
        const lang = b.options?.raw?.language || ''
        if (lang === 'json' || isJsonLike(b.raw)) return { type: 'json', content: b.raw }
        return { type: 'text', content: b.raw }
    }
    if (b.mode === 'urlencoded' && b.urlencoded) {
        return {
            type: 'x-www-form-urlencoded',
            data: b.urlencoded.map(f => ({ key: f.key || '', value: f.value || '', enabled: !f.disabled })),
        }
    }
    if (b.mode === 'formdata' && b.formdata) {
        return {
            type: 'form-data',
            data: b.formdata.map(f => ({ key: f.key || '', value: f.value || '', enabled: !f.disabled })),
        }
    }
    return { type: 'none' }
}

function postmanItem(item: unknown): ImportedRequest | ImportedFolder | null {
    if (!item || typeof item !== 'object') return null
    const i = item as {
        name?: string
        request?: {
            method?: string
            url?: unknown
            header?: Array<{ key: string; value: string; disabled?: boolean }>
            body?: unknown
            auth?: unknown
        }
        item?: unknown[]
    }

    if (i.item && Array.isArray(i.item)) {
        const folder: ImportedFolder = { name: i.name || 'Folder', requests: [], children: [] }
        for (const child of i.item) {
            const parsed = postmanItem(child)
            if (!parsed) continue
            if ('request' in parsed) folder.requests.push(parsed as ImportedRequest)
            else folder.children.push(parsed as ImportedFolder)
        }
        return folder
    }

    if (i.request) {
        const req = i.request
        const rawUrl = postmanUrlString(req.url)
        let baseUrl = rawUrl
        let params: QueryParam[] = postmanUrlParams(req.url)

        if (typeof req.url === 'string') {
            try {
                const urlObj = new URL(rawUrl)
                baseUrl = urlObj.origin + urlObj.pathname
                urlObj.searchParams.forEach((value, key) => params.push({ key, value, enabled: true }))
            } catch { /* keep rawUrl */ }
        }

        const request: Request = {
            method: normalizeMethod(req.method || 'GET'),
            url: baseUrl,
            params,
            headers: (req.header || [])
                .filter(h => !h.disabled)
                .map(h => ({ key: h.key || '', value: h.value || '', enabled: true })),
            auth: postmanAuth(req.auth),
            body: postmanBody(req.body),
            insecure: false,
        }

        return { name: i.name || 'Request', request }
    }

    return null
}

export function parsePostman(json: unknown): ImportedCollection {
    const col = json as { info?: { name?: string }; item?: unknown[] }
    const collection: ImportedCollection = {
        name: col.info?.name || 'Postman Collection',
        folders: [],
        requests: [],
    }
    for (const item of col.item || []) {
        const parsed = postmanItem(item)
        if (!parsed) continue
        if ('request' in parsed) collection.requests.push(parsed as ImportedRequest)
        else collection.folders.push(parsed as ImportedFolder)
    }
    return collection
}

// Insomnia v4 parser

type InsomniaResource = {
    _type: string
    _id: string
    parentId?: string
    name?: string
    method?: string
    url?: string
    headers?: Array<{ name: string; value: string; disabled?: boolean }>
    body?: {
        mimeType?: string
        text?: string
        params?: Array<{ name: string; value: string; disabled?: boolean }>
    }
    authentication?: {
        type?: string
        token?: string
        username?: string
        password?: string
        key?: string
        value?: string
        addTo?: string
    }
    parameters?: Array<{ name: string; value: string; disabled?: boolean }>
}

function insomniaAuth(auth?: InsomniaResource['authentication']): AuthConfig {
    if (!auth?.type) return { type: 'none' }
    if (auth.type === 'bearer') return { type: 'bearer', token: auth.token || '' }
    if (auth.type === 'basic') return { type: 'basic', username: auth.username || '', password: auth.password || '' }
    if (auth.type === 'apikey') {
        return {
            type: 'api-key',
            key: auth.key || '',
            value: auth.value || '',
            addTo: auth.addTo === 'queryParams' ? 'query' : 'header',
        }
    }
    return { type: 'none' }
}

function insomniaBody(body?: InsomniaResource['body']): RequestBody {
    if (!body) return { type: 'none' }
    const mime = body.mimeType || ''
    if (mime.includes('application/json') || (body.text && isJsonLike(body.text))) {
        return { type: 'json', content: body.text || '' }
    }
    if (mime.includes('application/x-www-form-urlencoded') && body.params) {
        return {
            type: 'x-www-form-urlencoded',
            data: body.params.map(p => ({ key: p.name || '', value: p.value || '', enabled: !p.disabled })),
        }
    }
    if (mime.includes('multipart/form-data') && body.params) {
        return {
            type: 'form-data',
            data: body.params.map(p => ({ key: p.name || '', value: p.value || '', enabled: !p.disabled })),
        }
    }
    if (body.text) return { type: 'text', content: body.text }
    return { type: 'none' }
}

function buildInsomniaFolder(
    groupId: string,
    name: string,
    resourceMap: Map<string, InsomniaResource[]>,
): ImportedFolder {
    const folder: ImportedFolder = { name, requests: [], children: [] }
    for (const child of resourceMap.get(groupId) || []) {
        if (child._type === 'request') {
            folder.requests.push({
                name: child.name || 'Request',
                request: {
                    method: normalizeMethod(child.method || 'GET'),
                    url: child.url || '',
                    params: (child.parameters || []).map(p => ({ key: p.name || '', value: p.value || '', enabled: !p.disabled })),
                    headers: (child.headers || []).filter(h => !h.disabled).map(h => ({ key: h.name || '', value: h.value || '', enabled: true })),
                    auth: insomniaAuth(child.authentication),
                    body: insomniaBody(child.body),
                    insecure: false,
                },
            })
        } else if (child._type === 'request_group') {
            folder.children.push(buildInsomniaFolder(child._id, child.name || 'Folder', resourceMap))
        }
    }
    return folder
}

export function parseInsomnia(json: unknown): ImportedCollection {
    const data = json as { resources?: InsomniaResource[] }
    const resources = data.resources || []
    const workspace = resources.find(r => r._type === 'workspace')

    const resourceMap = new Map<string, InsomniaResource[]>()
    for (const r of resources) {
        if (!r.parentId) continue
        if (!resourceMap.has(r.parentId)) resourceMap.set(r.parentId, [])
        resourceMap.get(r.parentId)!.push(r)
    }

    const collection: ImportedCollection = {
        name: workspace?.name || 'Insomnia Collection',
        folders: [],
        requests: [],
    }

    const workspaceId = workspace?._id
    if (!workspaceId) return collection

    for (const child of resourceMap.get(workspaceId) || []) {
        if (child._type === 'request') {
            collection.requests.push({
                name: child.name || 'Request',
                request: {
                    method: normalizeMethod(child.method || 'GET'),
                    url: child.url || '',
                    params: (child.parameters || []).map(p => ({ key: p.name || '', value: p.value || '', enabled: !p.disabled })),
                    headers: (child.headers || []).filter(h => !h.disabled).map(h => ({ key: h.name || '', value: h.value || '', enabled: true })),
                    auth: insomniaAuth(child.authentication),
                    body: insomniaBody(child.body),
                    insecure: false,
                },
            })
        } else if (child._type === 'request_group') {
            collection.folders.push(buildInsomniaFolder(child._id, child.name || 'Folder', resourceMap))
        }
    }

    return collection
}

export function detectFormat(input: string): ImportFormat {
    const trimmed = input.trim()
    if (trimmed.toLowerCase().startsWith('curl')) return 'curl'
    try {
        const json = JSON.parse(trimmed)
        if (
            json.__export_format === 4 ||
            (Array.isArray(json.resources) && json.resources.some((r: InsomniaResource) => r._type === 'workspace'))
        ) return 'insomnia'
        if (json.info?.schema?.includes('getpostman.com') || (json.info && Array.isArray(json.item))) return 'postman'
    } catch { /* not JSON */ }
    return 'unknown'
}

export function countCollectionRequests(col: ImportedCollection): number {
    return col.requests.length + col.folders.reduce((acc, f) => acc + countFolderRequests(f), 0)
}

function countFolderRequests(folder: ImportedFolder): number {
    return folder.requests.length + folder.children.reduce((acc, f) => acc + countFolderRequests(f), 0)
}

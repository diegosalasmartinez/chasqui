import type { Api, FolderNode } from '$lib/types/http'
import { workspaceStore } from '$lib/stores/workspace.svelte'
import { folderStore } from '$lib/stores/folder.svelte'
import { toastStore } from '$lib/stores/toast.svelte'
import { apiStore } from '$lib/stores/api.svelte'

function toPostmanRequest(api: Api): object {
    const { name, request } = api
    const { method, url, headers, params, auth, body } = request

    const urlObj: Record<string, unknown> = { raw: url }
    if (params.length) {
        urlObj.query = params.map(p => ({ key: p.key, value: p.value, disabled: !p.enabled }))
    }

    const header = headers.map(h => ({ key: h.key, value: h.value, disabled: !h.enabled }))

    let authObj: Record<string, unknown> | undefined
    if (auth.type === 'bearer') {
        authObj = { type: 'bearer', bearer: [{ key: 'token', value: auth.token, type: 'string' }] }
    } else if (auth.type === 'basic') {
        authObj = {
            type: 'basic', basic: [
                { key: 'username', value: auth.username, type: 'string' },
                { key: 'password', value: auth.password, type: 'string' },
            ]
        }
    } else if (auth.type === 'api-key') {
        authObj = {
            type: 'apikey', apikey: [
                { key: 'key', value: auth.key, type: 'string' },
                { key: 'value', value: auth.value, type: 'string' },
                { key: 'in', value: auth.addTo, type: 'string' },
            ]
        }
    }

    let bodyObj: Record<string, unknown> | undefined
    if (body.type === 'json') {
        bodyObj = { mode: 'raw', raw: body.content, options: { raw: { language: 'json' } } }
    } else if (body.type === 'text') {
        bodyObj = { mode: 'raw', raw: body.content }
    } else if (body.type === 'form-data') {
        bodyObj = { mode: 'formdata', formdata: body.data.map(d => ({ key: d.key, value: d.value, type: 'text' })) }
    } else if (body.type === 'x-www-form-urlencoded') {
        bodyObj = { mode: 'urlencoded', urlencoded: body.data.map(d => ({ key: d.key, value: d.value })) }
    }

    const req: Record<string, unknown> = { method, header, url: urlObj }
    if (authObj) req.auth = authObj
    if (bodyObj) req.body = bodyObj

    return { name, request: req }
}

function buildFolderItem(node: FolderNode, apis: Api[]): object {
    const folderApis = apis.filter(a => a.folder_id === node.id)
    return {
        name: node.name,
        item: [
            ...folderApis.map(toPostmanRequest),
            ...node.children.map(child => buildFolderItem(child, apis)),
        ],
    }
}

export function exportCollection() {
    const apis = apiStore.savedApis
    const tree = folderStore.tree
    const name = workspaceStore.currentWorkspace?.name ?? 'Collection'

    const collection = {
        info: {
            name,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: [
            ...apis.filter(a => !a.folder_id).map(toPostmanRequest),
            ...tree.map(node => buildFolderItem(node, apis)),
        ],
    }

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.postman_collection.json`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.info(`Collection "${name}" exported`)
}

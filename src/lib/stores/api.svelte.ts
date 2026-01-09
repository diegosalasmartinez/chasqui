import type { Response, Api, Request } from '$lib/types/http'
import { applyVariableSubstitution } from '$lib/utils/variables'
import { bodyPrettify } from '$lib/utils/common'
import { environmentStore } from '$lib/stores/environment.svelte'
import { historyStore } from '$lib/stores/history.svelte'
import { apiService } from '$lib/services/api.service'

const defaultRequest = (): Request => ({
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    auth: { type: 'none' },
    body: { type: 'none' },
    insecure: false,
})

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

class ApiStore {
    savedApis = $state<Api[]>([])
    savedApisLoading = $state<boolean>(false)
    private currentApi = $state<Api | null>(null)
    private unsavedChanges = $state(new Map<string, Api>())
    currentResponse = $state<Response | null>(null)
    currentResponseLoading = $state<boolean>(false)
    private lastResponses = $state(new Map<string, Response>())

    get api(): Api | null {
        if (!this.currentApi) return null

        if (this.currentApi.id) {
            const pending = this.unsavedChanges.get(this.currentApi.id)
            if (pending) return pending
        }

        return this.currentApi
    }

    get hasUnsavedChanges(): boolean {
        if (!this.currentApi?.id) return false
        return this.unsavedChanges.has(this.currentApi.id)
    }

    updateApi(mutator: (a: Api) => Api) {
        const current = this.api
        if (!current?.id) return

        const updated = mutator(deepClone(current))
        this.setUnsaved(current.id, updated)
    }

    private addApi(newApi: Api) {
        this.savedApis = [...this.savedApis, newApi]
    }

    private replaceApi(api: Api) {
        this.savedApis = this.savedApis.map(e => e.id === api.id ? api : e)
    }

    private removeApi(id: string) {
        this.savedApis = this.savedApis.filter(e => e.id !== id)
    }

    async createApi(folderId?: string) {
        const apiCreated = await apiService.createApi("New Request", defaultRequest(), folderId)
        if (apiCreated) {
            this.addApi(apiCreated)
            this.currentApi = apiCreated
            this.currentResponse = null
        }
        return apiCreated
    }

    selectApi(api: Api) {
        this.currentApi = api
        if (api.id) {
            const lastResponse = this.lastResponses.get(api.id)
            if (lastResponse) {
                this.currentResponse = lastResponse
                return
            }
        }

        this.currentResponse = null
    }

    async saveApi() {
        if (!this.api?.id) return

        const { id, name, request } = this.api

        const apiUpdated = await apiService.updateApi(id, name, request)
        if (apiUpdated) {
            this.replaceApi(apiUpdated)
            this.deleteUnsaved(apiUpdated.id!)
            this.currentApi = apiUpdated
        }
    }

    async deleteApi(api: Api) {
        if (!api.id) return

        await apiService.deleteApi(api.id)
        this.removeApi(api.id)

        if (this.currentApi?.id === api.id) {
            this.currentApi = null
            this.currentResponse = null
        }
    }

    async sendRequest() {
        if (!this.api) return
        this.currentResponseLoading = true;

        const { request } = this.api
        this.currentResponse = null

        // Apply variable substitution from selected environment
        const variables = environmentStore.variablesMap
        const substitutedRequest = applyVariableSubstitution(request, variables)

        const result = await apiService.sendRequest(substitutedRequest)
        if (result) {
            const response: Response = {
                status: result.response.status,
                headers: result.response.headers,
                body: bodyPrettify(result.response.body),
                at_ms: result.response.at_ms,
                duration_ms: result.response.duration_ms,
                size_bytes: result.response.size_bytes
            }
            this.currentResponse = response

            if (this.api.id) {
                const map = new Map(this.lastResponses)
                map.set(this.api.id, response)
                this.lastResponses = map
            }

            // Add to history store (with prettified body)
            historyStore.addEntry({
                ...result.history_entry,
                response: response
            })
        }
        this.currentResponseLoading = false;
    }

    async duplicateApi(api: Api) {
        const duplicated = await apiService.createApi(
            `${api.name} (Copy)`,
            deepClone(api.request),
            api.folder_id
        )
        if (duplicated) {
            this.addApi(duplicated)
            this.currentApi = duplicated
            this.currentResponse = null
        }
    }

    async listApis() {
        const apis = await apiService.listApis()
        this.savedApis = apis
    }

    private setUnsaved(id: string, api: Api) {
        this.unsavedChanges = new Map(this.unsavedChanges).set(id, api)
    }

    private deleteUnsaved(id: string) {
        const newMap = new Map(this.unsavedChanges)
        newMap.delete(id)
        this.unsavedChanges = newMap
    }
}

export const apiStore = new ApiStore()

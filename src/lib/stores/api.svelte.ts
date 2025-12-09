import { apiService } from '$lib/services/api.service'
import type { Response, Api } from '$lib/types/http'

const createDraftApi = (): Api => ({
    name: "New Request",
    request: {
        method: 'GET',
        url: 'https://httpbin.org/get',
        params: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
        insecure: false,
    }
})

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

class ApiStore {
    savedApis = $state<Api[]>([])
    private currentApi = $state<Api | null>(null)
    currentResponse = $state<Response | null>(null)
    private unsavedChanges = $state(new Map<string, Api>())

    get api(): Api | null {
        if (!this.currentApi) return null

        if (this.currentApi.id) {
            const pending = this.unsavedChanges.get(this.currentApi.id)
            if (pending) return pending
        }

        return this.currentApi
    }

    get hasUnsavedChanges(): boolean {
        if (!this.currentApi) return false
        if (!this.currentApi.id) return true
        return this.unsavedChanges.has(this.currentApi.id)
    }

    updateApi(mutator: (a: Api) => Api) {
        const current = this.api
        if (!current) return

        const updated = mutator(deepClone(current))

        if (current.id) {
            this.setUnsaved(current.id, updated)
        } else {
            this.currentApi = updated
        }
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

    selectNewRequest() {
        this.currentApi = createDraftApi()
        this.currentResponse = null
    }

    selectApi(api: Api) {
        this.currentApi = api
        this.currentResponse = null
    }

    async upsertApi() {
        if (!this.api) return

        const { id, name, request } = this.api

        if (id) {
            const apiUpdated = await apiService.updateApi(id, name, request)
            if (apiUpdated) {
                this.replaceApi(apiUpdated)
                this.deleteUnsaved(apiUpdated.id!)
                this.currentApi = apiUpdated
            }
        } else {
            const apiCreated = await apiService.saveApi(name, request)
            if (apiCreated) {
                this.addApi(apiCreated)
                this.currentApi = apiCreated
            }
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

        const { request } = this.api
        this.currentResponse = null

        const response = await apiService.sendRequest(request)
        if (response) {
            this.currentResponse = response
        }
    }

    duplicateApi(api: Api) {
        this.currentApi = {
            ...deepClone(api),
            id: undefined,
            name: `${api.name} (Copy)`,
        }
        this.currentResponse = null
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

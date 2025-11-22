import { apiService } from '$lib/services/api.service'
import type { Response, HeaderKV, Api } from '$lib/types/http'

const draftApi: Api = {
    name: "New Request",
    request: {
        method: 'GET',
        url: 'https://httpbin.org/get',
        headers: [],
        insecure: false,
    }
}

class ApiStore {
    savedApis = $state<Api[]>([])
    private currentApi = $state<Api | null>(null)
    currentResponse = $state<Response | null>(null)
    private draftApi = $state<Api>({ ...draftApi })
    private unsavedChanges = $state<Map<string, Api>>(new Map())

    get api(): Api {
        // First, check if there is any pending changes
        if (this.currentApi?.id) {
            const pending = this.unsavedChanges.get(this.currentApi.id)
            if (pending) return pending
        }
        // Otherwise, return current api
        return this.currentApi ?? this.draftApi
    }

    get hasUnsavedChanges(): boolean {
        if (!this.currentApi?.id) return false
        return this.unsavedChanges.has(this.currentApi.id)
    }

    updateApi(mutator: (a: Api) => Api) {
        if (this.currentApi?.id) {
            // Save changes in memory, instead of the current api
            const current = this.api
            const updated = mutator(current)

            this.setUnsaved(this.currentApi.id, updated);
        } else {
            // If this a new api, we updated it directly
            this.draftApi = mutator(this.draftApi)
        }
    }

    setHeader(i: number, kv: HeaderKV) {
        this.updateApi(a => {
            const headers = [...(a.request.headers ?? [])]
            headers[i] = kv
            return {
                ...a, request: {
                    ...a.request,
                    headers
                }
            }
        })
    }

    addApi(newApi: Api) {
        this.savedApis = [...this.savedApis, newApi]
    }

    replaceApi(api: Api) {
        this.savedApis = this.savedApis.map(e => e.id === api.id ? api : e)
    }

    removeApi(api: Api) {
        this.savedApis = this.savedApis.filter(e => e.id !== api.id)
    }

    selectNewRequest() {
        this.currentApi = { ...draftApi }
    }

    selectApi(api: Api) {
        // Current changes are stored in memory
        this.currentApi = api
        this.currentResponse = null
    }

    discardChanges(apiId: string) {
        this.deleteUnsaved(apiId);

        // Force re-render
        if (this.currentApi?.id === apiId) {
            this.currentApi = { ...this.currentApi }
        }
    }

    async upsertApi() {
        if (!this.currentApi) return;
        const { id, name, request } = this.currentApi;

        if (id) {
            const apiUpdated = await apiService.updateApi(id, name, request);
            if (apiUpdated) {
                this.replaceApi(apiUpdated);
                if (apiUpdated.id) this.deleteUnsaved(apiUpdated.id);
            }
        } else {
            const apiCreated = await apiService.saveApi(name, request);
            if (apiCreated) {
                this.addApi(apiCreated);
                this.currentApi = apiCreated
            }
        }
    }

    async sendRequest() {
        if (!this.currentApi) return;
        const { request } = this.currentApi;

        this.currentResponse = null;
        const response = await apiService.sendRequest(request)
        if (response) {
            this.currentResponse = response;
        }
    }

    async listApis() {
        const apis = await apiService.listApis();
        this.savedApis = apis;
    }

    // Map helpers
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

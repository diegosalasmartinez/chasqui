import { apiService } from '$lib/services/api.service'
import type { Response, Api } from '$lib/types/http'

const draftApi: Api = {
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
}

class ApiStore {
    savedApis = $state<Api[]>([])
    private currentApi = $state<Api | null>(null)
    currentResponse = $state<Response | null>(null)
    private draftApi = $state<Api>({ ...structuredClone(draftApi) })
    private unsavedChanges = $state(new Map<string, Api>())

    get api(): Api | null {
        // First, check if there is any pending changes
        if (this.currentApi?.id) {
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
        if (this.currentApi?.id) {
            // Save changes in memory, instead of the current api
            const current = this.api
            if (!current) return;

            const updated = mutator(current)
            this.setUnsaved(this.currentApi.id, updated);
        } else {
            // If this a new api, we updated it directly
            this.draftApi = mutator(this.draftApi)
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
        this.currentApi = structuredClone(draftApi)
        this.currentResponse = null
    }

    selectApi(api: Api) {
        // Current changes are stored in memory
        this.currentApi = api
        this.currentResponse = null
    }

    async upsertApi() {
        if (!this.api) return;
        const { id, name, request } = this.api;

        if (id) {
            const apiUpdated = await apiService.updateApi(id, name, request);
            if (apiUpdated) {
                this.replaceApi(apiUpdated);
                if (apiUpdated.id) this.deleteUnsaved(apiUpdated.id);
                this.currentApi = apiUpdated
            }
        } else {
            const apiCreated = await apiService.saveApi(name, request);
            if (apiCreated) {
                this.addApi(apiCreated);
                this.currentApi = apiCreated
            }
        }
    }

    async deleteApi(api: Api) {
        if (!api.id) return;

        await apiService.deleteApi(api.id);
        this.removeApi(api.id)
    }

    async sendRequest() {
        if (!this.api) return;
        const { request } = this.api;

        this.currentResponse = null;
        const response = await apiService.sendRequest(request)
        if (response) {
            this.currentResponse = response;
        }
    }

    duplicateApi(api: Api) {
        const duplicated: Api = structuredClone({
            ...api,
            id: undefined,
            name: `${api.name} (Copy)`,
        });

        this.addApi(duplicated);
        this.selectApi(duplicated);
    }

    async listApis() {
        const apis = await apiService.listApis();
        console.log('[DIEGO] apis', apis)
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

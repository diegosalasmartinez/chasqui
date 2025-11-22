import type { Request, Response, HeaderKV, Api } from '$lib/types/http'

const initialRequest: Request = {
    method: 'GET',
    url: 'https://httpbin.org/get',
    headers: [],
    insecure: false,
}

class RequestStore {
    savedApis = $state<Api[]>([])
    currentApi = $state<Api | null>(null)
    response = $state<Response | null>(null)
    private draftRequest = $state<Request>({ ...initialRequest })

    get request(): Request {
        return this.currentApi?.request ?? this.draftRequest
    }

    updateRequest(mutator: (r: Request) => Request) {
        if (this.currentApi) {
            this.currentApi = {
                ...this.currentApi,
                request: mutator(this.currentApi.request ?? { ...initialRequest })
            }
        } else {
            this.draftRequest = mutator(this.draftRequest ?? { ...initialRequest })
        }
    }

    setHeader(i: number, kv: HeaderKV) {
        this.updateRequest(r => {
            const headers = [...(r.headers ?? [])]
            headers[i] = kv
            return { ...r, headers }
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
        this.currentApi = {
            name: 'New request',
            request: { ...initialRequest }
        }
        this.response = null
    }

    setCurrentApiName(name: string) {
        if (this.currentApi) {
            this.currentApi = { ...this.currentApi, name }
        }
    }

    reset() {
        this.savedApis = []
        this.currentApi = null
        this.draftRequest = { ...initialRequest }
        this.response = null
    }
}

export const requestStore = new RequestStore()

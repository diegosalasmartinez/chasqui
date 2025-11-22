import type { Request } from '$lib/types/http'
import { requestStore } from "$lib/stores/request.svelte";
import { sendRequestBridge, createApiBridge, updateApiBridge, listApisBridge } from "$lib/infra/tauri";

class RequestService {
    async saveApi(id: string | undefined, name: string, req: Request) {
        try {
            if (id) {
                const updatedApi = await updateApiBridge(id, name, req);
                requestStore.replaceApi(updatedApi);
            } else {
                const newApi = await createApiBridge(name, req);
                requestStore.addApi(newApi);
            }
        } catch (err) {
            console.error(err);
        }

    }

    async sendRequest(req: Request) {
        try {
            requestStore.response = null;
            const res = await sendRequestBridge(req);
            requestStore.response = res;
        } catch (err) {
            console.error(err);
        }

    }

    async listApis() {
        const apis = await listApisBridge();
        requestStore.savedApis = apis;
    }
}

export const requestService = new RequestService();

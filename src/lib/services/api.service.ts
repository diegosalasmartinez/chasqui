import type { Request } from '$lib/types/http'
import { toastStore } from '$lib/stores/toast.svelte';
import { sendRequestBridge, createApiBridge, updateApiBridge, listApisBridge, deleteApiBridge } from "$lib/infra/tauri";

class ApiService {
    async createApi(name: string, req: Request, folderId?: string) {
        try {
            const response = await createApiBridge(name, req, folderId);
            toastStore.info("Request created")
            return response;
        } catch (err) {
            toastStore.error("Error: " + err)
        }
    }

    async updateApi(id: string, name: string, req: Request) {
        try {
            const response = await updateApiBridge(id, name, req);
            toastStore.info("API updated successfully")
            return response;
        } catch (err) {
            toastStore.error("Error: " + err)
        }
    }

    async deleteApi(id: string) {
        try {
            const response = await deleteApiBridge(id)
            toastStore.info("API deleted successfully")
            return response;
        } catch (err) {
            toastStore.error("Error: " + err)
        }
    }

    async sendRequest(req: Request) {
        try {
            return await sendRequestBridge(req);
        } catch (err) {
            toastStore.error("Error processing the request: " + err)
        }
    }

    async listApis() {
        try {
            return await listApisBridge();
        } catch (err) {
            toastStore.error("Error loading APIs: " + err)
            return []
        }
    }
}

export const apiService = new ApiService();

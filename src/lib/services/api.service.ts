import type { Request } from '$lib/types/http'
import { sendRequestBridge, createApiBridge, updateApiBridge, listApisBridge } from "$lib/infra/tauri";

class ApiService {
    async saveApi(name: string, req: Request) {
        try {
            return await createApiBridge(name, req);
        } catch (err) {
            console.error(err);
        }
    }

    async updateApi(id: string, name: string, req: Request) {
        try {
            return await updateApiBridge(id, name, req);
        } catch (err) {
            console.error(err);
        }
    }

    async sendRequest(req: Request) {
        try {
            return await sendRequestBridge(req);
        } catch (err) {
            console.error(err);
        }

    }

    async listApis() {
        try {
            return await listApisBridge();
        } catch (err) {
            console.error(err);
            return []
        }
    }
}

export const apiService = new ApiService();

import type { Request } from '$lib/types/http'
import { sendRequestBridge, createApiBridge, updateApiBridge, listApisBridge } from "$lib/services/tauriBridge";
import { response, addApi, replaceApi, savedApis } from "$lib/stores/request";

export const saveApi = async (id: string | undefined, name: string, req: Request) => {
    try {
        if (id) {
            const updatedApi = await updateApiBridge(id, name, req);
            replaceApi(updatedApi);
        } else {
            const newApi = await createApiBridge(name, req);
            addApi(newApi);
        }
    } catch (err) {
        console.error(err);
    }
}

export const sendRequest = async (req: Request) => {
    try {
        response.set(null);

        const res = await sendRequestBridge(req);
        response.set(res);
    } catch (err) {
        console.error(err);
    }
}

export const listApis = async () => {
    const apis = await listApisBridge();
    savedApis.set(apis);
}

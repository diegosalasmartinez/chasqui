import type { Request } from '$lib/types/http';

type ExportModalState = {
    open: boolean;
    request: Request | null;
    name: string;
};

function createExportModalStore() {
    let state = $state<ExportModalState>({
        open: false,
        request: null,
        name: '',
    });

    return {
        get open() {
            return state.open;
        },
        get request() {
            return state.request;
        },
        get name() {
            return state.name;
        },

        show(request: Request, name: string) {
            state = {
                open: true,
                request,
                name,
            };
        },

        close() {
            state = {
                open: false,
                request: null,
                name: '',
            };
        },
    };
}

export const exportModalStore = createExportModalStore();

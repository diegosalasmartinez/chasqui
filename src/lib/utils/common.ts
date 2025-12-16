import { toastStore } from "$lib/stores/toast.svelte";

export const clickOutside = (node: HTMLElement, cb: () => void) => {
    const onDocClick = (e: MouseEvent) => {
        if (!node.contains(e.target as Node)) cb();
    };

    document.addEventListener("click", onDocClick, true);
    return {
        destroy: () =>
            document.removeEventListener("click", onDocClick, true),
    };
}

export const copyToClipboard = async (txt: string, message?: string) => {
    try {
        await navigator.clipboard.writeText(txt);
        toastStore.info(message ?? 'Copied to your clipboard!');
    } catch {
        // Do nothing
    }
};

export const bodyPrettify = (body: Uint8Array | number[] | undefined) => {
    try {
        const buf = new Uint8Array(body as any);
        const rawBody = new TextDecoder().decode(buf);
        const pretty = JSON.stringify(JSON.parse(rawBody), null, 2);

        return pretty || rawBody;
    } catch {
        return "";
    }
}

export const fmtBytes = (n?: number) =>
    typeof n !== "number"
        ? "—"
        : n < 1024
            ? `${n} B`
            : n < 1024 ** 2
                ? `${(n / 1024).toFixed(1)} KB`
                : `${(n / 1024 ** 2).toFixed(1)} MB`;

export const fmtMs = (ms?: number) =>
    typeof ms !== "number"
        ? "—"
        : ms < 1000
            ? `${ms} ms`
            : `${(ms / 1000).toFixed(2)} s`;


import { toastStore } from "$lib/stores/toast.svelte";

export const clickOutside = (node: HTMLElement, cb: () => void) => {
    const onDocClick = (e: MouseEvent) => {
        if (!node.contains(e.target as Node)) cb();
    };

    document.addEventListener("click", onDocClick, true);
    return {
        destroy: () => document.removeEventListener("click", onDocClick, true),
    };
}

export const copyToClipboard = async (txt: string, message?: string) => {
    try {
        await navigator.clipboard.writeText(txt);
        toastStore.info(message ?? 'Copied to your clipboard!');
    } catch {
        // do nothing
    }
};

export const bodyPrettify = (body: Uint8Array | number[] | undefined, contentType?: string) => {
    if (!body) return "";
    const buf = new Uint8Array(body as any);

    if (contentType && contentType.startsWith("image/")) {
        let binary = "";
        buf.forEach((b) => (binary += String.fromCharCode(b)));
        const base64 = btoa(binary);
        const mime = contentType.split(";")[0].trim();
        return `data:${mime};base64,${base64}`;
    }

    try {
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

// Substitutes {{var_name}} placeholders with values from a Map
export const substituteVariables = (text: string, variables: Map<string, string>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = variables.get(varName);
        return value !== undefined ? value : match;
    });
};

export const defaultRequest = (): import("$lib/types/http").Request => ({
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    auth: { type: 'none' },
    body: { type: 'none' },
    insecure: false,
});

export const pluralize = (quantity: number, text: string) => {
    return `${quantity} ${text}${quantity !== 1 ? "s" : ""}`
}

export const copyToClipboard = async (txt: string) => {
    try {
        await navigator.clipboard.writeText(txt);
    } catch {
        // Do nothing
    }
};

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

<script lang="ts">
    import { importModalStore } from "$lib/stores/importModal.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { toastStore } from "$lib/stores/toast.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { pluralize } from "$lib/utils/common";
    import {
        parseCurl,
        detectFormat,
        parsePostman,
        parseInsomnia,
        countCollectionRequests,
    } from "$lib/utils/import";
    import type { ImportedFolder, ParseResult } from "$lib/types/import";
    import Modal from "$lib/ui/Modal.svelte";
    import CurlPreview from "./CurlPreview.svelte";
    import CollectionPreview from "./CollectionPreview.svelte";

    const FORMAT_LABELS: Record<string, string> = {
        curl: "curl",
        postman: "Postman",
        insomnia: "Insomnia",
    };

    let input = $state("");
    let importedName = $state("");
    let isImporting = $state(false);
    let fileInputRef: HTMLInputElement | null = $state(null);

    const parsed = $derived.by((): ParseResult | null => {
        const trimmed = input.trim();
        if (!trimmed) return null;

        const format = detectFormat(trimmed);

        try {
            if (format === "curl") {
                const result = parseCurl(trimmed);
                return {
                    format: "curl",
                    name: result.name,
                    request: result.request,
                };
            }
            if (format === "postman" || format === "insomnia") {
                const json = JSON.parse(trimmed);
                const collection =
                    format === "postman"
                        ? parsePostman(json)
                        : parseInsomnia(json);
                return { format, collection };
            }
        } catch (e) {
            return {
                format: "error",
                message: e instanceof Error ? e.message : String(e),
            };
        }

        return { format: "unknown" };
    });

    $effect(() => {
        if (parsed?.format === "curl") importedName = parsed.name;
    });

    function handleClose() {
        input = "";
        importedName = "";
        importModalStore.close();
    }

    function handleFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            input = (ev.target?.result as string) ?? "";
        };
        reader.readAsText(file);
    }

    async function importCurlRequest() {
        if (parsed?.format !== "curl") return;
        isImporting = true;
        try {
            const created = await apiStore.importApi(
                importedName || parsed.name,
                parsed.request,
            );
            if (created) {
                toastStore.info("Request imported");
                handleClose();
            }
        } finally {
            isImporting = false;
        }
    }

    async function importFolder(
        folder: ImportedFolder,
        parentId?: string,
    ): Promise<void> {
        const created = await folderStore.create(folder.name, parentId);
        if (!created?.id) return;
        await Promise.all([
            ...folder.children.map((child) => importFolder(child, created.id)),
            ...folder.requests.map((req) =>
                apiStore.importApi(req.name, req.request, created.id),
            ),
        ]);
    }

    async function importCollection() {
        if (parsed?.format !== "postman" && parsed?.format !== "insomnia") {
            return;
        }

        isImporting = true;
        try {
            const { collection } = parsed;
            const total = countCollectionRequests(collection);
            await Promise.all([
                ...collection.requests.map((req) =>
                    apiStore.importApi(req.name, req.request),
                ),
                ...collection.folders.map((folder) => importFolder(folder)),
            ]);
            toastStore.info(`Imported ${pluralize(total, "request")}`);
            handleClose();
        } finally {
            isImporting = false;
        }
    }
</script>

<Modal open={importModalStore.open} title="Import" onClose={handleClose}>
    <div class="import-modal">
        <div class="input-area">
            <textarea
                class="paste-input"
                placeholder="Paste a curl command or a Postman / Insomnia JSON export..."
                bind:value={input}
                spellcheck={false}
            ></textarea>

            <div class="file-row">
                <span class="file-hint">or</span>
                <button
                    class="ghost file-btn"
                    onclick={() => fileInputRef?.click()}
                >
                    Browse file
                </button>
                <input
                    bind:this={fileInputRef}
                    type="file"
                    accept=".json,.yaml,.yml"
                    class="hidden-file-input"
                    onchange={handleFile}
                />
            </div>
        </div>

        {#if parsed}
            <div class="preview-section">
                <div class="preview-header">
                    <span class="preview-label">Preview</span>
                    {#if parsed.format !== "unknown" && parsed.format !== "error"}
                        <span class="format-badge">
                            {FORMAT_LABELS[parsed.format] ?? parsed.format}
                        </span>
                    {/if}
                </div>

                {#if parsed.format === "curl"}
                    <CurlPreview
                        request={parsed.request}
                        bind:importedName
                        {isImporting}
                        onImport={importCurlRequest}
                    />
                {:else if parsed.format === "postman" || parsed.format === "insomnia"}
                    <CollectionPreview
                        collection={parsed.collection}
                        {isImporting}
                        onImport={importCollection}
                    />
                {:else if parsed.format === "error"}
                    <div class="error-message">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>Could not parse: {parsed.message}</span>
                    </div>
                {:else}
                    <div class="unknown-hint">
                        Supported formats: <strong>curl</strong>,
                        <strong>Postman</strong>
                        collection (v2.1), <strong>Insomnia</strong> export (v4)
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</Modal>

<style>
    .import-modal {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 540px;
        max-width: 640px;
    }

    .input-area {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .paste-input {
        width: 100%;
        height: 120px;
        resize: vertical;
        font-family: "Consolas", "Monaco", "Courier New", monospace;
        font-size: 12.5px;
        line-height: 1.5;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px;
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.15s ease;
        box-sizing: border-box;
    }

    .paste-input:focus {
        border-color: var(--accent);
    }

    .paste-input::placeholder {
        color: var(--text-tertiary);
    }

    .file-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .file-hint {
        font-size: 12px;
        color: var(--text-tertiary);
    }

    .file-btn {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--border);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .file-btn:hover {
        background: var(--hover);
        color: var(--text-primary);
    }

    .hidden-file-input {
        display: none;
    }

    .preview-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .preview-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
    }

    .format-badge {
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        color: var(--accent);
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--red) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--red) 25%, transparent);
        color: var(--red);
        font-size: 12.5px;
    }

    .unknown-hint {
        font-size: 12.5px;
        color: var(--text-tertiary);
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--surface);
        border: 1px solid var(--border);
    }

    .unknown-hint strong {
        color: var(--text-secondary);
    }
</style>

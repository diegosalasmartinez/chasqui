<script lang="ts">
    import { importModalStore } from "$lib/stores/importModal.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { toastStore } from "$lib/stores/toast.svelte";
    import Modal from "$lib/ui/Modal.svelte";
    import { COLORS } from "$lib/constants/http.constants";
    import {
        detectFormat,
        parseCurl,
        parsePostman,
        parseInsomnia,
        countCollectionRequests,
        type ImportedFolder,
        type ImportedCollection,
        type ParseResult,
    } from "$lib/utils/import";
    import type { RequestBody } from "$lib/types/http";

    let input = $state("");
    let importedName = $state("");
    let isImporting = $state(false);
    let fileInputRef: HTMLInputElement | null = $state(null);

    const FORMAT_LABELS: Record<string, string> = {
        curl: "curl",
        postman: "Postman",
        insomnia: "Insomnia",
    };

    const BODY_LABELS: Record<RequestBody["type"], string> = {
        none: "no body",
        json: "JSON body",
        text: "text body",
        "form-data": "form-data",
        "x-www-form-urlencoded": "url-encoded",
    };

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
        if (parsed?.format !== "postman" && parsed?.format !== "insomnia")
            return;
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
            toastStore.info(`Imported ${total} request${total !== 1 ? "s" : ""}`);
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
                        <span class="format-badge">{FORMAT_LABELS[parsed.format] ?? parsed.format}</span>
                    {/if}
                </div>

                {#if parsed.format === "curl"}
                    <div class="preview-card">
                        <div class="request-line">
                            <span
                                class="method-badge"
                                style:color={COLORS[parsed.request.method]}
                            >
                                {parsed.request.method}
                            </span>
                            <span class="url-text">{parsed.request.url}</span>
                        </div>

                        <div class="meta-row">
                            <span>
                                {parsed.request.headers.length} header{parsed
                                    .request.headers.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                            <span class="dot">·</span>
                            <span>
                                {parsed.request.params.length} param{parsed
                                    .request.params.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                            <span class="dot">·</span>
                            <span>{BODY_LABELS[parsed.request.body.type]}</span>
                            {#if parsed.request.auth.type !== "none"}
                                <span class="dot">·</span>
                                <span>{parsed.request.auth.type} auth</span>
                            {/if}
                        </div>

                        <div class="name-field">
                            <label for="import-name">Name</label>
                            <input
                                id="import-name"
                                type="text"
                                bind:value={importedName}
                                placeholder="Request name"
                            />
                        </div>
                    </div>

                    <div class="actions">
                        <button
                            class="primary"
                            onclick={importCurlRequest}
                            disabled={isImporting}
                        >
                            {isImporting ? "Importing..." : "Import Request"}
                        </button>
                    </div>
                {:else if parsed.format === "postman" || parsed.format === "insomnia"}
                    {@const col = parsed.collection}
                    {@const totalReqs = countCollectionRequests(col)}
                    {@const folders = col.folders.length}

                    <div class="preview-card">
                        <div class="collection-name">{col.name}</div>
                        <div class="meta-row">
                            {#if folders > 0}
                                <span
                                    >{folders} folder{folders !== 1
                                        ? "s"
                                        : ""}</span
                                >
                                <span class="dot">·</span>
                            {/if}
                            <span
                                >{totalReqs} request{totalReqs !== 1
                                    ? "s"
                                    : ""}</span
                            >
                        </div>

                        {#if col.folders.length > 0 || col.requests.length > 0}
                            <div class="tree-preview">
                                {#each col.requests as req}
                                    <div class="tree-item root-item">
                                        <span
                                            class="method-badge small"
                                            style:color={COLORS[
                                                req.request.method
                                            ]}
                                        >
                                            {req.request.method}
                                        </span>
                                        <span class="item-name">{req.name}</span
                                        >
                                    </div>
                                {/each}
                                {#each col.folders as folder}
                                    <div class="tree-folder">
                                        <div class="folder-row">
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                class="folder-icon"
                                            >
                                                <path
                                                    d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                />
                                            </svg>
                                            <span class="folder-name"
                                                >{folder.name}</span
                                            >
                                            <span class="folder-count"
                                                >{folder.requests.length +
                                                    folder.children
                                                        .length}</span
                                            >
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div class="actions">
                        <button
                            class="primary"
                            onclick={importCollection}
                            disabled={isImporting || totalReqs === 0}
                        >
                            {isImporting ? "Importing..." : "Import Collection"}
                        </button>
                    </div>
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
                        <span
                            >Supported formats: <strong>curl</strong>,
                            <strong>Postman</strong>
                            collection (v2.1), <strong>Insomnia</strong> export (v4)</span
                        >
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

    .preview-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .request-line {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .method-badge {
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
    }

    .method-badge.small {
        font-size: 10.5px;
    }

    .url-text {
        font-family: "Consolas", "Monaco", monospace;
        font-size: 12px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-tertiary);
        flex-wrap: wrap;
    }

    .dot {
        color: var(--text-tertiary);
        opacity: 0.5;
    }

    .name-field {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-top: 4px;
        border-top: 1px solid var(--border);
    }

    .name-field label {
        font-size: 12px;
        color: var(--text-secondary);
        font-weight: 500;
        flex-shrink: 0;
    }

    .name-field input {
        flex: 1;
        font-size: 12.5px;
        background: transparent;
        border: none !important;
        box-shadow: none !important;
        outline: none;
        color: var(--text-primary);
        padding: 0;
        border-bottom: 1px solid transparent;
        transition: border-color 0.15s ease;
    }

    .name-field input:focus {
        border-bottom-color: var(--accent);
    }

    .collection-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .tree-preview {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-top: 6px;
        border-top: 1px solid var(--border);
        max-height: 180px;
        overflow-y: auto;
    }

    .tree-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 6px;
        border-radius: 4px;
    }

    .root-item {
        padding-left: 4px;
    }

    .item-name {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tree-folder {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .folder-row {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 4px;
        border-radius: 4px;
    }

    .folder-icon {
        color: var(--text-tertiary);
        flex-shrink: 0;
    }

    .folder-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .folder-count {
        font-size: 11px;
        color: var(--text-tertiary);
        background: var(--hover);
        padding: 1px 6px;
        border-radius: 10px;
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

    .actions {
        display: flex;
        justify-content: flex-end;
    }

    .actions button {
        padding-left: 16px;
        padding-right: 16px;
        font-size: 12.5px;
        background: var(--action);
    }
</style>

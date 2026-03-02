<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import type { Request, RequestBody } from "$lib/types/http";
    import { pluralize } from "$lib/utils/common";

    const BODY_LABELS: Record<RequestBody["type"], string> = {
        none: "no body",
        json: "JSON body",
        text: "text body",
        "form-data": "form-data",
        "x-www-form-urlencoded": "url-encoded",
    };

    type Props = {
        request: Request;
        importedName: string;
        isImporting: boolean;
        onImport: () => void;
    };

    let {
        request,
        importedName = $bindable(),
        isImporting,
        onImport,
    }: Props = $props();
</script>

<div class="preview-card">
    <div class="request-line">
        <span class="method-badge" style:color={COLORS[request.method]}>
            {request.method}
        </span>
        <span class="url-text">{request.url}</span>
    </div>

    <div class="meta-row">
        <span>{pluralize(request.headers.length, "header")}</span>
        <span class="dot">·</span>
        <span>{pluralize(request.params.length, "param")}</span>
        <span class="dot">·</span>
        <span>{BODY_LABELS[request.body.type]}</span>
        {#if request.auth.type !== "none"}
            <span class="dot">·</span>
            <span>{request.auth.type} auth</span>
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
    <button class="primary" onclick={onImport} disabled={isImporting}>
        {isImporting ? "Importing..." : "Import Request"}
    </button>
</div>

<style>
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

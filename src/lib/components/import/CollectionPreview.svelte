<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import type { ImportedCollection } from "$lib/types/import";
    import { pluralize } from "$lib/utils/common";
    import { countCollectionRequests } from "$lib/utils/import";

    type Props = {
        collection: ImportedCollection;
        isImporting: boolean;
        onImport: () => void;
    };

    let { collection, isImporting, onImport }: Props = $props();

    const totalReqs = $derived(countCollectionRequests(collection));
</script>

<div class="preview-card">
    <div class="collection-name">{collection.name}</div>

    <div class="meta-row">
        {#if collection.folders.length > 0}
            <span>
                {pluralize(collection.folders.length, "folder")}
            </span>
            <span class="dot">·</span>
        {/if}
        <span>{pluralize(totalReqs, "request")}</span>
    </div>

    {#if collection.folders.length > 0 || collection.requests.length > 0}
        <div class="tree-preview">
            {#each collection.requests as req}
                <div class="tree-item">
                    <span
                        class="method-badge"
                        style:color={COLORS[req.request.method]}
                    >
                        {req.request.method}
                    </span>
                    <span class="item-name">{req.name}</span>
                </div>
            {/each}
            {#each collection.folders as folder}
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
                    <span class="folder-name">{folder.name}</span>
                    <span class="folder-count"
                        >{folder.requests.length + folder.children.length}</span
                    >
                </div>
            {/each}
        </div>
    {/if}
</div>

<div class="actions">
    <button
        class="primary"
        onclick={onImport}
        disabled={isImporting || totalReqs === 0}
    >
        {isImporting ? "Importing..." : "Import Collection"}
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

    .collection-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
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
        padding: 3px 4px;
        border-radius: 4px;
    }

    .method-badge {
        font-size: 10.5px;
        font-weight: 700;
        flex-shrink: 0;
    }

    .item-name {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

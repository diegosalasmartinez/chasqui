<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { dragStore } from "$lib/stores/drag.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import type { MenuItem } from "$lib/types/menu";
    import type { Api } from "$lib/types/http";
    import FolderItem from "$lib/components/FolderItem.svelte";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    // APIs without a folder (root level)
    const rootApis = $derived(apiStore.savedApis.filter((a) => !a.folder_id));
    const showDropHighlight = $derived(dragStore.isHoveringRoot());

    function onSelectApi(api: Api) {
        apiStore.selectApi(api);
    }

    function getMenuItems(api: Api): MenuItem[] {
        return [
            {
                label: "Duplicate",
                onClick: () => apiStore.duplicateApi(api),
            },
            {
                label: "Delete",
                danger: true,
                onClick: () => apiStore.deleteApi(api),
            },
        ];
    }

    // Mouse-based drag handlers
    function handleMouseDown(e: MouseEvent, api: Api) {
        if (!api.id || e.button !== 0) return;
        const target = e.currentTarget as HTMLElement;
        dragStore.startDrag(api.id, target, e);
    }

    async function handleMouseUp() {
        if (!dragStore.draggingApiId || !dragStore.isHoveringRoot()) return;

        const apiId = dragStore.draggingApiId;

        // Don't move if already at root
        const api = apiStore.savedApis.find((a) => a.id === apiId);
        if (!api?.folder_id) {
            return;
        }

        // Move to root (no folder)
        const updated = await folderStore.moveApi(apiId, undefined);
        if (updated) {
            apiStore.savedApis = apiStore.savedApis.map((a) =>
                a.id === apiId ? updated : a,
            );
        }
    }

    // Global mouseup to end drag
    function handleGlobalMouseUp() {
        dragStore.endDrag();
    }
</script>

<svelte:window onmouseup={handleGlobalMouseUp} />

<section id="saved-requests">
    <!-- Folders -->
    {#each folderStore.tree as folder}
        <FolderItem {folder} apis={apiStore.savedApis} />
    {/each}

    <!-- Root drop zone -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="root-drop-zone"
        class:drag-over={showDropHighlight}
        data-drop-zone="root"
        onmouseup={handleMouseUp}
        role="list"
    >
        <!-- Root-level APIs (no folder) -->
        {#each rootApis as req}
            <button
                class="saved-request {req.id === apiStore.api?.id
                    ? 'active'
                    : ''}"
                class:dragging={dragStore.draggingApiId === req.id}
                onmousedown={(e) => handleMouseDown(e, req)}
                onclick={() => onSelectApi(req)}
            >
                <div class="request-info">
                    <span
                        class="method"
                        style:color={COLORS[req.request.method]}
                    >
                        {req.request.method}
                    </span>
                    <span class="name">{req.name}</span>
                </div>

                {#if req.id === apiStore.api?.id}
                    <ContextMenu items={getMenuItems(req)} />
                {/if}
            </button>
        {/each}

        {#if rootApis.length === 0 && dragStore.draggingApiId}
            <div class="drop-hint" class:visible={showDropHighlight}>
                Drop here to move to root
            </div>
        {/if}
    </div>
</section>

<style>
    #saved-requests {
        font-size: 12.5px;
        padding: 5px;
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }

    .root-drop-zone {
        flex: 1;
        min-height: 40px;
        border-radius: 8px;
        border: 2px dashed transparent;
        transition: all 0.15s ease;
    }

    .root-drop-zone.drag-over {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .saved-request {
        width: 100%;
        background: transparent;
        box-shadow: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 0;
        cursor: grab;
        user-select: none;
    }

    .saved-request:active {
        cursor: grabbing;
    }

    .saved-request.dragging {
        opacity: 0.5;
    }

    .saved-request.active,
    .saved-request:hover {
        background: var(--hover);
    }

    .request-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .method {
        font-size: 11px;
        font-weight: 600;
        text-align: left;
    }

    .drop-hint {
        padding: 12px;
        text-align: center;
        color: var(--text-tertiary);
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .drop-hint.visible {
        opacity: 1;
    }
</style>

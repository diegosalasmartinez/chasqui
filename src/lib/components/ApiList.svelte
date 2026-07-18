<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { dragStore } from "$lib/stores/drag.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { exportModalStore } from "$lib/stores/exportModal.svelte";
    import type { MenuItem } from "$lib/types/menu";
    import type { Api } from "$lib/types/http";
    import FolderItem from "$lib/components/FolderItem.svelte";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    type Props = { searchQuery?: string };
    let { searchQuery = "" }: Props = $props();

    const query = $derived(searchQuery.toLowerCase().trim());

    const allRootApis = $derived(apiStore.savedApis.filter((a) => !a.folder_id));
    const rootApis = $derived(
        allRootApis.filter(
            (a) =>
                !query ||
                a.name.toLowerCase().includes(query) ||
                a.request.url.toLowerCase().includes(query),
        ),
    );
    const showDropHighlight = $derived(dragStore.isHoveringRoot());

    function onSelectApi(api: Api) {
        if (dragStore.justDropped) return;
        apiStore.selectApi(api);
    }

    function getMenuItems(api: Api): MenuItem[] {
        return [
            {
                label: "Export",
                onClick: () => exportModalStore.show(api.request, api.name),
            },
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

    function handleMouseDown(e: MouseEvent, api: Api) {
        if (!api.id || e.button !== 0) return;
        const target = e.currentTarget as HTMLElement;
        dragStore.startDrag(api.id, target, e);
    }

    function handleItemMouseMove(e: MouseEvent, index: number) {
        if (!dragStore.isDragging) return;
        const el = e.currentTarget as HTMLElement;
        dragStore.setHoverOnItem("root", index, el.getBoundingClientRect(), e.clientY);
    }

    function handleRootMouseEnter() {
        dragStore.setHoverRoot();
    }

    function handleRootMouseLeave() {
        dragStore.clearHoverTarget("root");
        dragStore.clearItemHover();
    }

    async function handleDrop() {
        // Folder drops are handled by FolderItem; the root zone only accepts APIs
        const apiId = dragStore.draggingApiId;
        if (!apiId) return;

        if (dragStore.insertionPoint?.groupId === "root") {
            // The insertion index is relative to the (possibly search-filtered)
            // visible list — translate it to an index in the full root list
            const visibleIndex = dragStore.insertionPoint.index;
            const fullIndex =
                visibleIndex >= rootApis.length
                    ? allRootApis.length
                    : allRootApis.findIndex((a) => a.id === rootApis[visibleIndex].id);
            await apiStore.moveAndInsertApi(apiId, undefined, fullIndex);
            return;
        }

        if (!dragStore.isHoveringRoot()) return;
        const api = apiStore.savedApis.find((a) => a.id === apiId);
        if (!api?.folder_id) return;

        const updated = await folderStore.moveApi(apiId, undefined);
        if (updated) apiStore.updateApiInList(updated);
    }

    function handleGlobalMouseUp() {
        dragStore.endDrag();
    }
</script>

<svelte:window onmouseup={handleGlobalMouseUp} />

<section id="saved-requests">
    {#if folderStore.tree.length === 0 && apiStore.savedApis.length === 0}
        <div class="empty-state">No collections yet</div>
    {:else}
        {#each folderStore.tree as folder}
            <FolderItem {folder} apis={apiStore.savedApis} {searchQuery} />
        {/each}

        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
            class="root-drop-zone"
            class:drag-over={showDropHighlight}
            onmouseenter={handleRootMouseEnter}
            onmouseleave={handleRootMouseLeave}
            onmouseup={handleDrop}
            role="list"
        >
            {#each rootApis as req, i (req.id)}
                <button
                    class="saved-request sidebar-item"
                    class:active={req.id === apiStore.api?.id}
                    class:dragging={dragStore.draggingApiId === req.id}
                    onmousedown={(e) => handleMouseDown(e, req)}
                    onmousemove={(e) => handleItemMouseMove(e, i)}
                    onclick={() => onSelectApi(req)}
                >
                    <div class="request-info">
                        <span class="method" style:color={COLORS[req.request.method]}>
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
    {/if}
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

    /* During drag, suppress hover highlight on non-active items */
    :global(body.is-dragging) .saved-request:hover:not(.active) {
        background: transparent;
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

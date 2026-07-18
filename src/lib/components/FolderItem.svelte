<script lang="ts">
    import type { Api, FolderNode } from "$lib/types/http";
    import { COLORS } from "$lib/constants/http.constants";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { dragStore } from "$lib/stores/drag.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { exportModalStore } from "$lib/stores/exportModal.svelte";
    import ChevronIcon from "$lib/ui/icons/ChevronIcon.svelte";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";
    import FolderItem from "./FolderItem.svelte";

    type Props = {
        folder: FolderNode;
        apis: Api[];
        searchQuery?: string;
    };

    let { folder, apis, searchQuery = "" }: Props = $props();

    let isEditing = $state(false);
    let editName = $state(folder.name);
    let inputRef: HTMLInputElement | null = $state(null);

    const query = $derived(searchQuery.toLowerCase().trim());

    function folderHasMatches(f: FolderNode, allApis: Api[], q: string): boolean {
        if (!q) return true;
        if (f.name.toLowerCase().includes(q)) return true;
        const direct = allApis.filter((a) => a.folder_id === f.id);
        if (direct.some((a) => a.name.toLowerCase().includes(q) || a.request.url.toLowerCase().includes(q)))
            return true;
        return f.children.some((child) => folderHasMatches(child, allApis, q));
    }

    const isVisible = $derived(folderHasMatches(folder, apis, query));
    const isExpanded = $derived(query ? isVisible : folderStore.isExpanded(folder.id));
    const allFolderApis = $derived(apis.filter((a) => a.folder_id === folder.id));
    const folderApis = $derived(
        allFolderApis.filter(
            (a) =>
                !query ||
                a.name.toLowerCase().includes(query) ||
                a.request.url.toLowerCase().includes(query),
        ),
    );
    const showDropHighlight = $derived(dragStore.isHoveringFolder(folder.id));

    function toggle() {
        folderStore.toggleExpanded(folder.id);
    }

    function onSelectApi(api: Api) {
        if (dragStore.justDropped) return;
        apiStore.selectApi(api);
    }

    function startEditing() {
        editName = folder.name;
        isEditing = true;
        setTimeout(() => inputRef?.select(), 0);
    }

    async function saveEdit() {
        if (editName.trim() && editName !== folder.name) {
            await folderStore.update(folder.id, editName.trim());
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editName = folder.name;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") saveEdit();
        else if (e.key === "Escape") cancelEdit();
    }

    async function createRequestInFolder() {
        await apiStore.createApi(folder.id);
        folderStore.expand(folder.id);
    }

    function handleMouseDown(e: MouseEvent, api: Api) {
        if (!api.id || e.button !== 0) return;
        const target = e.currentTarget as HTMLElement;
        dragStore.startDrag(api.id, target, e);
    }

    function handleItemMouseMove(e: MouseEvent, index: number) {
        if (!dragStore.isDragging) return;
        const el = e.currentTarget as HTMLElement;
        dragStore.setHoverOnItem(folder.id, index, el.getBoundingClientRect(), e.clientY);
    }

    function handleHeaderEnter() {
        dragStore.setHoverFolder(folder.id);
    }

    function handleHeaderLeave() {
        dragStore.clearHoverTarget(folder.id);
    }

    function handleChildrenLeave() {
        dragStore.clearItemHover();
    }

    async function handleDrop() {
        if (!dragStore.isDragging) return;
        const apiId = dragStore.draggingApiId!;

        if (dragStore.insertionPoint?.groupId === folder.id) {
            // The insertion index is relative to the (possibly search-filtered)
            // visible list — translate it to an index in the full folder list
            const visibleIndex = dragStore.insertionPoint.index;
            const fullIndex =
                visibleIndex >= folderApis.length
                    ? allFolderApis.length
                    : allFolderApis.findIndex((a) => a.id === folderApis[visibleIndex].id);
            await apiStore.moveAndInsertApi(apiId, folder.id, fullIndex);
            folderStore.expand(folder.id);
            return;
        }

        if (!dragStore.isHoveringFolder(folder.id)) return;
        const api = apis.find((a) => a.id === apiId);
        if (api?.folder_id === folder.id) return;

        const updated = await folderStore.moveApi(apiId, folder.id);
        if (updated) {
            apiStore.updateApiInList(updated);
            folderStore.expand(folder.id);
        }
    }

    function getApiMenuItems(api: Api) {
        return [
            { label: "Export", onClick: () => exportModalStore.show(api.request, api.name) },
            { label: "Duplicate", onClick: () => apiStore.duplicateApi(api) },
            { label: "Delete", danger: true, onClick: () => apiStore.deleteApi(api) },
        ];
    }

    function getFolderMenuItems() {
        return [
            { label: "New request", onClick: createRequestInFolder },
            { label: "New folder inside", onClick: async () => { await folderStore.create("New Folder", folder.id); } },
            { label: "Rename", onClick: startEditing },
            { label: "Delete", danger: true, onClick: () => folderStore.delete(folder.id) },
        ];
    }
</script>

{#if isVisible}
    <div class="folder-item">
        <div
            class="folder-header sidebar-item"
            class:drag-over={showDropHighlight}
            onmouseenter={handleHeaderEnter}
            onmouseleave={handleHeaderLeave}
            onmouseup={handleDrop}
            role="button"
            tabindex="0"
        >
            <button class="folder-toggle" onclick={toggle}>
                <span class="chevron" class:collapsed={!isExpanded}>
                    <ChevronIcon size={12} />
                </span>
            </button>
            {#if isEditing}
                <input
                    bind:this={inputRef}
                    bind:value={editName}
                    class="folder-name-input"
                    onblur={saveEdit}
                    onkeydown={handleKeydown}
                />
            {:else}
                <button class="folder-name-btn" onclick={toggle} ondblclick={startEditing}>
                    {folder.name}
                </button>
            {/if}
            <ContextMenu items={getFolderMenuItems()} />
        </div>

        {#if isExpanded}
            <div
                class="folder-children"
                onmouseup={handleDrop}
                onmouseleave={handleChildrenLeave}
                role="list"
            >
                {#each folder.children as child (child.id)}
                    <FolderItem folder={child} {apis} {searchQuery} />
                {/each}

                {#each folderApis as api, i (api.id)}
                    <button
                        class="api-item sidebar-item"
                        class:active={api.id === apiStore.api?.id}
                        class:dragging={dragStore.draggingApiId === api.id}
                        onmousedown={(e) => handleMouseDown(e, api)}
                        onmousemove={(e) => handleItemMouseMove(e, i)}
                        onclick={() => onSelectApi(api)}
                    >
                        <div class="request-info">
                            <span class="method" style:color={COLORS[api.request.method]}>
                                {api.request.method}
                            </span>
                            <span class="name">{api.name}</span>
                        </div>

                        {#if api.id === apiStore.api?.id}
                            <ContextMenu items={getApiMenuItems(api)} />
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<style>
    .folder-item {
        width: 100%;
    }

    .folder-header {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        height: 40px;
        border-radius: 8px;
        padding: 7.5px 0 7.5px 8px;
        border: 1px dashed transparent;
        font-size: 12.5px;
        color: var(--text-secondary);
        transition: all 0.15s ease;
    }

    .folder-header:hover:not(.drag-over) {
        background: var(--hover);
        border-color: var(--border);
        border-style: solid;
    }

    .folder-header.drag-over {
        background: color-mix(in srgb, var(--accent) 15%, transparent) !important;
        border-color: var(--accent) !important;
        border-style: dashed !important;
    }

    .folder-toggle {
        height: auto;
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .chevron {
        display: flex;
        align-items: center;
        color: var(--text-tertiary);
        transition: transform 0.15s ease;
    }

    .chevron.collapsed {
        transform: rotate(-90deg);
    }

    .folder-name-btn {
        flex: 1;
        height: auto;
        text-align: left;
        font-weight: 500;
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0px 4px;
        cursor: pointer;
        color: inherit;
        font-size: inherit;
    }

    .folder-name-input {
        flex: 1;
        height: auto;
        font-weight: 500;
        background: var(--surface);
        border: 1px solid var(--accent);
        border-radius: 4px;
        padding: 2px 4px;
        color: var(--text-primary);
        font-size: inherit;
        outline: none;
    }

    .folder-children {
        width: 100%;
        position: relative;
        margin-left: 16px;
        padding-left: 12px;
        border-left: 1px solid var(--border);
        max-width: -webkit-fill-available;
    }

    .folder-children > :global(.folder-item) {
        position: relative;
    }

    .folder-children > :global(.folder-item)::before {
        content: "";
        position: absolute;
        left: -12px;
        top: 20px;
        width: 10px;
        height: 1px;
        background: var(--border);
    }

    .api-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 6px 8px;
        padding-left: 12px;
        padding-right: 0;
        background: transparent;
        box-shadow: none;
        font-size: 12.5px;
        cursor: grab;
        user-select: none;
        position: relative;
    }

    .api-item::before {
        content: "";
        position: absolute;
        left: -12px;
        top: 50%;
        width: 10px;
        height: 1px;
        background: var(--border);
    }

    .api-item:active {
        cursor: grabbing;
    }

    .api-item.dragging {
        opacity: 0.5;
    }

    .api-item.active,
    .api-item:hover {
        background: var(--hover);
    }

    /* During drag, suppress hover highlight on non-active items */
    :global(body.is-dragging) .api-item:hover:not(.active),
    :global(body.is-dragging) .folder-header:hover:not(.drag-over) {
        background: transparent;
        border-color: transparent;
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
</style>

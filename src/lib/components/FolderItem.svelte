<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore, type FolderNode } from "$lib/stores/folder.svelte";
    import type { Api } from "$lib/types/http";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    type Props = {
        folder: FolderNode;
        apis: Api[];
        depth?: number;
    };

    let { folder, apis, depth = 0 }: Props = $props();

    let isEditing = $state(false);
    let editName = $state(folder.name);
    let inputRef: HTMLInputElement | null = $state(null);

    const isExpanded = $derived(folderStore.isExpanded(folder.id));
    const folderApis = $derived(apis.filter((a) => a.folder_id === folder.id));

    function toggle() {
        folderStore.toggleExpanded(folder.id);
    }

    function onSelectApi(api: Api) {
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
        if (e.key === "Enter") {
            saveEdit();
        } else if (e.key === "Escape") {
            cancelEdit();
        }
    }

    function createRequestInFolder() {
        const newApi = {
            name: "New Request",
            folder_id: folder.id,
            request: {
                method: "GET" as const,
                url: "",
                params: [],
                headers: [],
                auth: { type: "none" as const },
                body: { type: "none" as const },
                insecure: false,
            },
        };
        apiStore.selectApi(newApi);
        folderStore.expand(folder.id);
    }

    async function moveApiTo(api: Api, folderId?: string) {
        const updated = await folderStore.moveApi(api.id!, folderId);
        if (updated) {
            apiStore.savedApis = apiStore.savedApis.map((a) =>
                a.id === api.id ? updated : a,
            );
            if (folderId) {
                folderStore.expand(folderId);
            }
        }
    }

    function getApiMenuItems(api: Api) {
        const items: Array<{
            label: string;
            onClick: () => void;
            danger?: boolean;
        }> = [
            {
                label: "Duplicate",
                onClick: () => apiStore.duplicateApi(api),
            },
            {
                label: "Move to root",
                onClick: () => moveApiTo(api, undefined),
            },
        ];

        // Add move options for other folders
        for (const f of folderStore.folders) {
            if (f.id !== folder.id) {
                items.push({
                    label: `Move to ${f.name}`,
                    onClick: () => moveApiTo(api, f.id),
                });
            }
        }

        items.push({
            label: "Delete",
            danger: true,
            onClick: () => apiStore.deleteApi(api),
        });

        return items;
    }

    function getFolderMenuItems() {
        return [
            {
                label: "New request",
                onClick: createRequestInFolder,
            },
            {
                label: "New folder inside",
                onClick: async () => {
                    await folderStore.create("New Folder", folder.id);
                },
            },
            {
                label: "Rename",
                onClick: startEditing,
            },
            {
                label: "Delete",
                danger: true,
                onClick: () => folderStore.delete(folder.id),
            },
        ];
    }
</script>

<div class="folder-item" style:--depth={depth}>
    <div class="folder-header">
        <button class="folder-toggle" onclick={toggle}>
            <span class="chevron">{isExpanded ? "▼" : "▶"}</span>
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
            <button
                class="folder-name-btn"
                onclick={toggle}
                ondblclick={startEditing}
            >
                {folder.name}
            </button>
        {/if}
        <ContextMenu items={getFolderMenuItems()} />
    </div>

    {#if isExpanded}
        <div class="folder-children">
            {#each folder.children as child}
                <svelte:self folder={child} {apis} depth={depth + 1}
                ></svelte:self>
            {/each}

            {#each folderApis as api}
                <button
                    class="api-item {api.id === apiStore.api?.id
                        ? 'active'
                        : ''}"
                    onclick={() => onSelectApi(api)}
                >
                    <div class="request-info">
                        <span
                            class="method"
                            style:color={COLORS[api.request.method]}
                        >
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
        padding-top: 7.5px;
        padding-bottom: 7.5px;
        padding-left: calc(15px + var(--depth) * 12px);
        padding-right: 0;
        border: 1px solid transparent;
        font-size: 12.5px;
        color: var(--text-secondary);
    }

    .folder-header:hover {
        background: var(--hover);
        border-color: var(--border);
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
        font-size: 8px;
        width: 12px;
        opacity: 0.7;
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
    }

    .api-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 6px 8px;
        padding-left: calc(32px + var(--depth) * 12px);
        padding-right: 0;
        background: transparent;
        box-shadow: none;
        font-size: 12.5px;
    }

    .api-item.active,
    .api-item:hover {
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
    }
</style>

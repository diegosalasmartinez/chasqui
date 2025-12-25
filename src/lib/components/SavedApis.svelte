<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import type { MenuItem } from "$lib/types/menu";
    import type { Api } from "$lib/types/http";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";
    import FolderItem from "./FolderItem.svelte";

    // APIs without a folder (root level)
    const rootApis = $derived(apiStore.savedApis.filter((a) => !a.folder_id));

    function onSelectApi(api: Api) {
        apiStore.selectApi(api);
    }

    async function moveApiToFolder(api: Api, folderId: string) {
        const updated = await folderStore.moveApi(api.id!, folderId);
        if (updated) {
            apiStore.savedApis = apiStore.savedApis.map((a) =>
                a.id === api.id ? updated : a,
            );
            folderStore.expand(folderId);
        }
    }

    function getMenuItems(api: Api) {
        const items: MenuItem[] = [
            {
                label: "Duplicate",
                onClick: () => apiStore.duplicateApi(api),
            },
        ];

        // Add "Move to [folder]" options for each folder
        for (const folder of folderStore.folders) {
            items.push({
                label: `Move to ${folder.name}`,
                onClick: () => moveApiToFolder(api, folder.id),
            });
        }

        items.push({
            label: "Delete",
            danger: true,
            onClick: () => apiStore.deleteApi(api),
        });

        return items;
    }
</script>

<section id="saved-requests">
    <!-- Folders -->
    {#each folderStore.tree as folder}
        <FolderItem {folder} apis={apiStore.savedApis} />
    {/each}

    <!-- Root-level APIs (no folder) -->
    {#each rootApis as req}
        <button
            class="saved-request {req.id === apiStore.api?.id ? 'active' : ''}"
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
</section>

<style>
    #saved-requests {
        font-size: 12.5px;
        padding: 5px;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .saved-request {
        background: transparent;
        box-shadow: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 0;
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
    }
</style>

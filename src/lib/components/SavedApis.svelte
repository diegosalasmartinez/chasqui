<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { apiStore } from "$lib/stores/api.svelte";
    import type { Api } from "$lib/types/http";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    function onSelectApi(api: Api) {
        apiStore.selectApi(api);
    }

    function getMenuItems(api: Api) {
        return [
            {
                label: "Duplicate",
                onClick: () => {
                    apiStore.duplicateApi(api);
                },
            },
            {
                label: "Delete",
                danger: true,
                onClick: () => {
                    apiStore.deleteApi(api);
                },
            },
        ];
    }
</script>

<section id="saved-requests">
    {#each apiStore.savedApis as req}
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

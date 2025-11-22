<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { requestStore } from "$lib/stores/request.svelte";
    import type { Api } from "$lib/types/http";

    const onSelectApi = (api: Api) => {
        requestStore.currentApi = api;
        requestStore.response = null;
    };
</script>

<section id="saved-requests">
    {#each requestStore.savedApis as req}
        <button class="saved-request" onclick={() => onSelectApi(req)}>
            <span class="method" style:color={COLORS[req.request.method]}>
                {req.request.method}
            </span>
            <span class="name">{req.name}</span>
        </button>
    {/each}
</section>

<style>
    #saved-requests {
        font-size: 14px;
        margin-top: 20px;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .saved-request {
        background: transparent;
        box-shadow: none;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .method {
        font-size: 12px;
        font-weight: 600;
    }
</style>

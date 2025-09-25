<script lang="ts">
    import { savedApis, currentApi, response } from "$lib/stores/request";
    import type { Api } from "$lib/types/http";

    const onClickApis = (api: Api) => {
        currentApi.set(api);
        response.set(null);
    };
</script>

<section id="saved-requests">
    {#each $savedApis as req}
        <button class="saved-request" on:click={() => onClickApis(req)}>
            <span class="method" style:color={"red"}>{req.request.method}</span>
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
        gap: 5px;
    }

    .saved-request {
        background: transparent;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .saved-request .method {
        font-size: 12px;
        font-weight: 500;
    }
</style>

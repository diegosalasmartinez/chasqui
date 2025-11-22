<script lang="ts">
    import { onMount } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

    onMount(async () => {
        await apiStore.listApis();
    });
</script>

<main>
    <Sidebar />

    <div class="container">
        {#if apiStore.api}
            <RequestEditor />
            <ResponseViewer />
        {:else}
            <section>
                <h2>Welcome home</h2>
            </section>
        {/if}
    </div>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        column-gap: 20px;
        min-height: 100dvh;
        padding: 20px;
    }

    .container {
        width: 100%;
        padding: 0px 20px 20px 20px;
    }
</style>

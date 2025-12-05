<script lang="ts">
    import { onMount } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import ToastContainer from "$lib/ui/ToastContainer.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
    import LeftPanel from "$lib/layouts/LeftPanel.svelte";

    onMount(async () => {
        await apiStore.listApis();
    });
</script>

<main>
    <Sidebar />
    <LeftPanel />

    <section class="main-panel">
        {#if apiStore.api}
            <RequestEditor />

            {#if apiStore.currentResponse}
                <ResponseViewer />
            {:else}
                <section>
                    <h2>No response yet</h2>
                </section>
            {/if}
        {:else}
            <h2>Welcome home</h2>
        {/if}
    </section>

    <ToastContainer />
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 60px 230px minmax(0, 1fr);
        min-height: 100dvh;
    }

    .main-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        min-height: 100dvh;
    }
</style>

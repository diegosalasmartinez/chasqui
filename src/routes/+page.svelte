<script lang="ts">
    import { onMount } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import ResponseLoading from "$lib/components/response/ResponseLoading.svelte";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import NoResponse from "$lib/components/response/NoResponse.svelte";
    import ToastContainer from "$lib/ui/ToastContainer.svelte";
    import LeftPanel from "$lib/layouts/LeftPanel.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

    onMount(async () => {
        await Promise.all([apiStore.listApis(), folderStore.load()]);
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
            {:else if apiStore.currentResponseLoading}
                <ResponseLoading />
            {:else}
                <NoResponse />
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

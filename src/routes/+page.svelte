<script lang="ts">
    import { onMount } from "svelte";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import { sidebarStore } from "$lib/stores/sidebar.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import ResponseLoading from "$lib/components/response/ResponseLoading.svelte";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import EnvEditor from "$lib/components/environment/EnvEditor.svelte";
    import NoResponse from "$lib/components/response/NoResponse.svelte";
    import ToastContainer from "$lib/ui/ToastContainer.svelte";
    import LeftPanel from "$lib/layouts/LeftPanel.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

    onMount(async () => {
        await Promise.all([
            apiStore.listApis(),
            folderStore.load(),
            environmentStore.load(),
        ]);
    });
</script>

<main>
    <Sidebar />
    <LeftPanel />

    <section
        class="main-panel"
        class:single-column={sidebarStore.isEnvironments || !apiStore.api}
    >
        {#if sidebarStore.isEnvironments}
            {#if environmentStore.selected}
                <EnvEditor />
            {:else}
                <div class="empty-panel">
                    <p>Select an environment to edit variables</p>
                </div>
            {/if}
        {:else if apiStore.api}
            <RequestEditor />

            {#if apiStore.currentResponse}
                <ResponseViewer />
            {:else if apiStore.currentResponseLoading}
                <ResponseLoading />
            {:else}
                <NoResponse />
            {/if}
        {:else}
            <div class="empty-panel">
                <p>Select a request or create a new one</p>
            </div>
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

    .main-panel.single-column {
        grid-template-columns: 1fr;
    }

    .empty-panel {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-tertiary);
        font-size: 14px;
        border-top: 0.5px solid var(--border);
    }
</style>

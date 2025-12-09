<script lang="ts">
    import { onMount } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import SendSvg from "$lib/assets/icons/send.svg?raw";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import ToastContainer from "$lib/ui/ToastContainer.svelte";
    import LeftPanel from "$lib/layouts/LeftPanel.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

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
                <section class="no-response">
                    <div>
                        <h2>
                            Hit the send button
                            {@html SendSvg}
                        </h2>
                        <h4>And start making your requests!</h4>
                    </div>
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

    .no-response {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--text-primary);
        font-weight: 400;
    }
</style>

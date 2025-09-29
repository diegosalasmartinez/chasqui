<script lang="ts">
    import { onMount } from "svelte";
    import { listApis } from "$lib/use-cases/api";
    import ResponseViewer from "$lib/components/ResponseViewer.svelte";
    import RequestEditor from "$lib/components/RequestEditor.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

    onMount(async () => {
        await listApis();
    });
</script>

<main>
    <Sidebar />

    <div class="container">
        <RequestEditor />
        <ResponseViewer />
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
        padding: 10px 20px;
    }
</style>

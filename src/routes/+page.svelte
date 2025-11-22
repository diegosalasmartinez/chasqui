<script lang="ts">
    import { onMount } from "svelte";
    import { requestService } from "$lib/services/request.service";
    import ResponseViewer from "$lib/components/response/ResponseViewer.svelte";
    import RequestEditor from "$lib/components/request-form/RequestEditor.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";

    onMount(async () => {
        await requestService.listApis();
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
        padding: 0px 20px 20px 20px;
    }
</style>

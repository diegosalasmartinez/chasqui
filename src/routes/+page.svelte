<script lang="ts">
    import RequestEditor from "$lib/components/RequestEditor.svelte";
    import ResponseViewer from "$lib/components/ResponseViewer.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
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
        padding: 20px 20px;
    }

    .container {
        width: 100%;
        padding: 20px 20px;
    }
</style>

<script lang="ts">
    import EnvSelector from "$lib/ui/EnvSelector.svelte";
    import WorkspaceSelector from "$lib/ui/WorkspaceSelector.svelte";
</script>

<header class="app-header">
    <div class="header-left">
        <WorkspaceSelector />
    </div>

    <div class="header-right">
        <EnvSelector />
    </div>
</header>

<style>
    .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
        height: 40px;
        background: var(--bg-darker);
        border-top: 0.5px solid var(--border);
        border-bottom: 0.5px solid var(--border);
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }
</style>

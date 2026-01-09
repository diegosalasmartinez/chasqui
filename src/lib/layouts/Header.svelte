<script lang="ts">
    import EnvSelector from "$lib/ui/EnvSelector.svelte";
</script>

<header class="app-header">
    <div class="header-left">
        <!-- Future: workspace selector -->
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
        background: var(--bg);
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

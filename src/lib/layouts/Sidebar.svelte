<script lang="ts">
    import { sidebarStore } from "$lib/stores/sidebar.svelte";
    import ThemeToggler from "$lib/components/ThemeToggler.svelte";
    import FolderIcon from "$lib/ui/icons/FolderIcon.svelte";
    import SettingsIcon from "$lib/ui/icons/SettingsIcon.svelte";
</script>

<aside id="sidebar">
    <div class="top">
        <div class="logo">c</div>

        <nav class="nav-items">
            <button
                class="nav-btn"
                class:active={sidebarStore.isCollections}
                onclick={() => sidebarStore.setView("collections")}
                title="Collections"
            >
                <FolderIcon />
            </button>
            <button
                class="nav-btn"
                class:active={sidebarStore.isEnvironments}
                onclick={() => sidebarStore.setView("environments")}
                title="Environments"
            >
                <SettingsIcon />
            </button>
        </nav>
    </div>

    <ThemeToggler />
</aside>

<style>
    #sidebar {
        min-height: max-content;
        width: 100%;
        height: 100%;
        padding: 10px 0;
        background: var(--bg-darker);
        border: 0.5px solid var(--border);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .top {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .logo {
        padding: 0;
        margin: 0;
        font-size: 28px;
        font-weight: 500;
        color: var(--text-primary);
        height: 40px;
    }

    .nav-items {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .nav-btn {
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 8px;
        box-shadow: none;
        color: var(--text-secondary);
        opacity: 0.6;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .nav-btn:hover,
    .nav-btn.active {
        opacity: 1;
        background: var(--hover);
        color: var(--text-primary);
    }
</style>

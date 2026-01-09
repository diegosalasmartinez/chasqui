<script lang="ts">
    import { environmentStore } from "$lib/stores/environment.svelte";
    import { historyStore } from "$lib/stores/history.svelte";
    import { sidebarStore } from "$lib/stores/sidebar.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import HistoryList from "$lib/components/history/HistoryList.svelte";
    import EnvList from "$lib/components/environment/EnvList.svelte";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";
    import ApiList from "$lib/components/ApiList.svelte";
    import AddIcon from "$lib/ui/icons/AddIcon.svelte";

    const collectionMenuItems = [
        {
            label: "New Request",
            onClick: () => apiStore.createApi(),
        },
        {
            label: "New Folder",
            onClick: () => folderStore.create("New Folder"),
        },
    ];

    const environmentMenuItems = [
        {
            label: "New Environment",
            onClick: () => environmentStore.create(),
        },
    ];

    const historyMenuItems = [
        {
            label: "Clear History",
            danger: true,
            onClick: () => historyStore.clear(),
        },
    ];

    const title = $derived(
        sidebarStore.isCollections
            ? "Collections"
            : sidebarStore.isEnvironments
              ? "Environments"
              : "History",
    );

    const menuItems = $derived(
        sidebarStore.isCollections
            ? collectionMenuItems
            : sidebarStore.isEnvironments
              ? environmentMenuItems
              : historyMenuItems,
    );

    const showAddButton = $derived(!sidebarStore.isHistory);

    function handleAdd() {
        if (sidebarStore.isCollections) {
            apiStore.createApi();
        } else if (sidebarStore.isEnvironments) {
            environmentStore.create();
        }
    }
</script>

<aside id="left-panel">
    <section class="header">
        <span>{title}</span>

        <div class="actions-right">
            {#if showAddButton}
                <button
                    class="ghost icon-btn"
                    onclick={handleAdd}
                    title={sidebarStore.isCollections
                        ? "New Request"
                        : "New Environment"}
                >
                    <AddIcon />
                </button>
            {/if}
            <ContextMenu items={menuItems} />
        </div>
    </section>

    {#if sidebarStore.isCollections}
        <ApiList />
    {:else if sidebarStore.isEnvironments}
        <EnvList />
    {:else}
        <HistoryList />
    {/if}
</aside>

<style>
    #left-panel {
        height: 100%;
        width: 100%;
        color: var(--text-secondary);
        border-right: 0.5px solid var(--border);
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .header {
        height: 50px;
        background: var(--bg-darker);
        padding: 15px 6px 15px 20px;
        border-bottom: 0.5px solid var(--border);
        font-size: 13px;
        display: flex;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
    }

    .actions-right {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .icon-btn {
        padding: 4px;
    }
</style>

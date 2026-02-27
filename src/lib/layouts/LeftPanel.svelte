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
    import CloseIcon from "$lib/ui/icons/CloseIcon.svelte";

    let searchQuery = $state("");

    $effect(() => {
        void sidebarStore.isCollections;
        void sidebarStore.isEnvironments;
        searchQuery = "";
    });

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
        <div class="search-wrapper">
            <svg
                class="search-icon"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                class="search-input"
                placeholder={title}
                bind:value={searchQuery}
            />
            {#if searchQuery}
                <button
                    class="clear-btn ghost icon-btn"
                    onclick={() => (searchQuery = "")}
                    title="Clear"
                >
                    <CloseIcon size={10} />
                </button>
            {/if}
        </div>

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
        <ApiList {searchQuery} />
    {:else if sidebarStore.isEnvironments}
        <EnvList {searchQuery} />
    {:else}
        <HistoryList {searchQuery} />
    {/if}
</aside>

<style>
    #left-panel {
        height: 100%;
        width: 100%;
        color: var(--text-secondary);
        background: var(--bg-darker);
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

    .search-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;
    }

    .search-icon {
        color: var(--text-tertiary);
        flex-shrink: 0;
    }

    .search-input {
        flex: 1;
        background: transparent;
        border: none;
        box-shadow: none;
        outline: none;
        font-size: 13px;
        color: var(--text-secondary);
        padding: 0;
        min-width: 0;
        font-weight: 500;
    }

    .search-input::placeholder {
        color: var(--text-secondary);
        font-weight: 500;
    }

    .search-input:focus::placeholder {
        color: var(--text-tertiary);
    }

    .clear-btn {
        padding: 2px;
        color: var(--text-tertiary);
        display: flex;
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

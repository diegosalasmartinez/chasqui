<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import SavedApis from "$lib/components/SavedApis.svelte";
    import AddSvg from "$lib/assets/icons/add.svg?raw";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    const menuItems = [
        {
            label: "New Request",
            onClick: () => apiStore.selectNewRequest(),
        },
        {
            label: "New Folder",
            onClick: async () => {
                await folderStore.create("New Folder");
            },
        },
    ];
</script>

<aside id="left-panel">
    <section class="new-actions">
        <span>Collections</span>

        <div class="actions-right">
            <button
                class="ghost icon-btn"
                onclick={() => apiStore.selectNewRequest()}
                title="New Request"
            >
                {@html AddSvg}
            </button>
            <ContextMenu items={menuItems} />
        </div>
    </section>

    <SavedApis />
</aside>

<style>
    #left-panel {
        min-height: max-content;
        height: 100%;
        width: 100%;
        color: var(--text-secondary);
        border-right: 0.5px solid var(--border);
        border-top: 0.5px solid var(--border);
        border-bottom: 0.5px solid var(--border);
    }

    .new-actions {
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

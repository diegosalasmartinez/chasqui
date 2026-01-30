<script lang="ts">
    import { clickOutside } from "$lib/utils/common";
    import { workspaceStore } from "$lib/stores/workspace.svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { folderStore } from "$lib/stores/folder.svelte";
    import { historyStore } from "$lib/stores/history.svelte";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import ChevronIcon from "$lib/ui/icons/ChevronIcon.svelte";
    import AddIcon from "$lib/ui/icons/AddIcon.svelte";

    let open = $state(false);
    let isCreating = $state(false);
    let newWorkspaceName = $state("");

    const selected = $derived(workspaceStore.currentWorkspace);
    const workspaces = $derived(workspaceStore.workspaces);

    function toggleOpen() {
        open = !open;
    }

    function closeMenu() {
        open = false;
        isCreating = false;
        newWorkspaceName = "";
    }

    function selectWorkspace(id: string) {
        if (id !== workspaceStore.currentWorkspaceId) {
            workspaceStore.selectWorkspace(id);
            // Clear selections when switching workspace
            apiStore.clearSelection();
            historyStore.clearSelection();
            environmentStore.clearSelection();
        }
        closeMenu();
    }

    function startCreating() {
        isCreating = true;
        newWorkspaceName = "";
    }

    async function createWorkspace() {
        if (newWorkspaceName.trim()) {
            await workspaceStore.createWorkspace(newWorkspaceName.trim());
            // Clear selections for new workspace
            apiStore.clearSelection();
            historyStore.clearSelection();
            environmentStore.clearSelection();
        }
        closeMenu();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            createWorkspace();
        } else if (e.key === "Escape") {
            closeMenu();
        }
    }
</script>

<div class="workspace-selector" use:clickOutside={closeMenu}>
    <button
        type="button"
        class="workspace-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onclick={toggleOpen}
    >
        <span class="workspace-name">{selected?.name || "No Workspace"}</span>
        <span class="chevron" class:open>
            <ChevronIcon size={14} />
        </span>
    </button>

    {#if open}
        <ul class="workspace-list" role="listbox">
            {#each workspaces as workspace}
                <li role="option" aria-selected={selected?.id === workspace.id}>
                    <button
                        type="button"
                        class="workspace-item"
                        class:active={selected?.id === workspace.id}
                        onclick={() => selectWorkspace(workspace.id)}
                    >
                        {workspace.name}
                    </button>
                </li>
            {/each}

            <li class="divider"></li>

            {#if isCreating}
                <li class="create-input-wrapper">
                    <input
                        type="text"
                        class="create-input"
                        placeholder="Workspace name"
                        bind:value={newWorkspaceName}
                        onkeydown={handleKeydown}
                    />
                </li>
            {:else}
                <li>
                    <button
                        type="button"
                        class="workspace-item create-btn"
                        onclick={startCreating}
                    >
                        <AddIcon size={14} />
                        <span>New Workspace</span>
                    </button>
                </li>
            {/if}
        </ul>
    {/if}
</div>

<style>
    .workspace-selector {
        position: relative;
    }

    .workspace-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--bg);
        border: 0.5px solid var(--border);
        border-left: 0;
        box-shadow: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 12px;
    }

    .workspace-trigger:hover {
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-left: 0;
    }

    .workspace-name {
        color: var(--text-primary);
        font-weight: 500;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .chevron {
        display: flex;
        color: var(--text-secondary);
        transition: transform 0.2s ease;
    }

    .chevron.open {
        transform: rotate(180deg);
    }

    .workspace-list {
        position: absolute;
        left: 0;
        top: 30px;
        z-index: 100;
        list-style: none;
        padding: 4px;
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 8px;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.15s ease-out;
    }

    .workspace-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 6px;
        font-size: 13px;
        color: var(--text-primary);
        text-align: left;
        transition: background 0.1s ease;
    }

    .workspace-item:hover {
        background: var(--hover);
    }

    .workspace-item.active {
        background: var(--hover);
        font-weight: 500;
    }

    .divider {
        height: 1px;
        background: var(--border);
        margin: 4px 8px;
    }

    .create-btn {
        color: var(--text-secondary);
    }

    .create-btn:hover {
        color: var(--text-primary);
    }

    .create-input-wrapper {
        padding: 4px;
    }

    .create-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--bg);
        color: var(--text-primary);
        font-size: 13px;
    }

    .create-input:focus {
        outline: none;
        border-color: var(--blue);
    }
</style>

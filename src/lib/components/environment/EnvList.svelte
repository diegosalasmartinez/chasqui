<script lang="ts">
    import type { Environment } from "$lib/types/http";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import ContextMenu from "$lib/ui/ContextMenu.svelte";

    type Props = { searchQuery?: string };
    let { searchQuery = "" }: Props = $props();

    const query = $derived(searchQuery.toLowerCase().trim());
    const filteredEnvironments = $derived(
        query
            ? environmentStore.environments.filter((e) =>
                  e.name.toLowerCase().includes(query),
              )
            : environmentStore.environments,
    );

    let editingId = $state<string | null>(null);
    let editName = $state("");
    let inputRef: HTMLInputElement | null = $state(null);

    function selectEnvironment(env: Environment) {
        if (editingId !== env.id) {
            environmentStore.select(env.id);
        }
    }

    function startEditing(env: Environment) {
        editingId = env.id;
        editName = env.name;
        setTimeout(() => inputRef?.select(), 0);
    }

    async function saveEdit(env: Environment) {
        if (editName.trim() && editName !== env.name) {
            await environmentStore.update(env.id, editName.trim());
        }
        editingId = null;
    }

    function cancelEdit() {
        editingId = null;
    }

    function handleKeydown(e: KeyboardEvent, env: Environment) {
        if (e.key === "Enter") {
            saveEdit(env);
        } else if (e.key === "Escape") {
            cancelEdit();
        }
    }

    function getMenuItems(env: Environment) {
        return [
            {
                label: "Rename",
                onClick: () => startEditing(env),
            },
            {
                label: "Duplicate",
                onClick: async () => {
                    const newEnv = await environmentStore.create(
                        `${env.name} (Copy)`,
                    );
                    if (newEnv && env.variables.length > 0) {
                        await environmentStore.update(newEnv.id, undefined, [
                            ...env.variables,
                        ]);
                    }
                },
            },
            {
                label: "Delete",
                danger: true,
                onClick: () => environmentStore.delete(env.id),
            },
        ];
    }
</script>

<section id="environments-list">
    {#if environmentStore.environments.length === 0}
        <div class="empty-state">No environments yet</div>
    {:else if filteredEnvironments.length === 0}
        <div class="empty-state">No matches</div>
    {:else}
        {#each filteredEnvironments as env}
            <button
                type="button"
                class="env-item sidebar-item"
                class:selected={environmentStore.selectedId === env.id}
                onclick={() => selectEnvironment(env)}
            >
                {#if editingId === env.id}
                    <input
                        bind:this={inputRef}
                        bind:value={editName}
                        class="env-name-input"
                        onblur={() => saveEdit(env)}
                        onkeydown={(e) => handleKeydown(e, env)}
                        onclick={(e) => e.stopPropagation()}
                    />
                {:else}
                    <span class="env-name">{env.name}</span>
                {/if}

                <ContextMenu items={getMenuItems(env)} />
            </button>
        {/each}
    {/if}
</section>

<style>
    #environments-list {
        font-size: 12.5px;
        padding: 5px;
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
    }

    .env-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s ease;
        width: 100%;
        background: transparent;
        border: none;
        box-shadow: none;
        font-size: inherit;
        color: inherit;
    }

    .env-item:hover {
        background: var(--hover);
    }

    .env-item.selected {
        background: var(--hover);
    }

    .env-item :global(.menu-trigger) {
        opacity: 0;
    }

    .env-item.selected :global(.menu-trigger),
    .env-item :global(.menu-trigger.open) {
        opacity: 0.6;
    }

    .env-item.selected :global(.menu-trigger:hover),
    .env-item :global(.menu-trigger.open) {
        opacity: 1;
    }

    .env-name {
        flex: 1;
        font-weight: 500;
    }

    .env-name-input {
        flex: 1;
        height: auto;
        font-weight: 500;
        background: var(--surface);
        border: 1px solid var(--accent);
        border-radius: 4px;
        padding: 2px 6px;
        color: var(--text-primary);
        font-size: inherit;
        outline: none;
    }

</style>

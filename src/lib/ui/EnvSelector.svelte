<script lang="ts">
    import { clickOutside } from "$lib/utils/common";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import ChevronIcon from "$lib/ui/icons/ChevronIcon.svelte";

    let open = $state(false);

    const selected = $derived(environmentStore.selected);
    const environments = $derived(environmentStore.environments);

    function toggleOpen() {
        open = !open;
    }

    function closeMenu() {
        open = false;
    }

    function selectEnv(id: string | null) {
        environmentStore.select(id);
        closeMenu();
    }
</script>

<div class="env-selector" use:clickOutside={closeMenu}>
    <button
        type="button"
        class="env-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onclick={toggleOpen}
    >
        <span class="env-label">ENV</span>
        <span class="env-name">{selected?.name || "No Environment"}</span>
        <span class="chevron" class:open>
            <ChevronIcon size={14} />
        </span>
    </button>

    {#if open}
        <ul class="env-list" role="listbox">
            <li role="option" aria-selected={!selected}>
                <button
                    type="button"
                    class="env-item"
                    class:active={!selected}
                    onclick={() => selectEnv(null)}
                >
                    No Environment
                </button>
            </li>
            {#each environments as env}
                <li role="option" aria-selected={selected?.id === env.id}>
                    <button
                        type="button"
                        class="env-item"
                        class:active={selected?.id === env.id}
                        onclick={() => selectEnv(env.id)}
                    >
                        {env.name}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .env-selector {
        position: relative;
    }

    .env-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: var(--bg);
        border: 0.5px solid var(--border);
        border-right: 0;
        box-shadow: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 12px;
    }

    .env-trigger:hover {
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-right: 0;
    }

    .env-label {
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 0.05em;
    }

    .env-name {
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

    .env-list {
        position: absolute;
        right: 0;
        top: 30px;
        z-index: 100;
        list-style: none;
        padding: 4px;
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 8px;
        min-width: 180px;
        max-height: 300px;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.15s ease-out;
    }

    .env-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        box-shadow: none;
        cursor: pointer;
        border-radius: 6px;
        font-size: 13px;
        color: var(--text-primary);
        text-align: left;
        transition: background 0.1s ease;
    }

    .env-item:hover {
        background: var(--hover);
    }

    .env-item.active {
        background: var(--hover);
        font-weight: 500;
    }
</style>

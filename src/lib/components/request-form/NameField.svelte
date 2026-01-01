<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";

    let isEditingName = $state(false);
    let nameInputRef = $state<HTMLInputElement>();

    const displayName = $derived(apiStore.api?.name);

    function startEditingName() {
        isEditingName = true;
        setTimeout(() => nameInputRef?.select(), 0);
    }

    function finishEditingName() {
        isEditingName = false;
    }

    function handleNameInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;

        apiStore.updateApi((a) => ({
            ...a,
            name: value,
        }));
    }

    function handleNameKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            finishEditingName();
        } else if (e.key === "Escape") {
            e.preventDefault();
            finishEditingName();
        }
    }
</script>

<div class="name-container">
    {#if isEditingName}
        <input
            bind:this={nameInputRef}
            class="name-input ghost"
            value={displayName}
            oninput={handleNameInput}
            onblur={finishEditingName}
            onkeydown={handleNameKeyDown}
        />
    {:else}
        <button
            type="button"
            class="name-display ghost"
            onclick={startEditingName}
            title="Click to edit name"
        >
            <h1>{displayName}</h1>
        </button>
    {/if}
</div>

<style>
    .name-container {
        display: flex;
        flex: 1;
        min-width: 0;
    }

    .name-display {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 12px;
        border: none;
        background: transparent;
        opacity: 100% !important;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.15s ease;
        min-width: 0;
        height: 30px;
    }

    .name-display:hover {
        background: var(--hover);
    }

    .name-display h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .name-input {
        padding: 0 11.35px;
        font-size: 16px;
        font-weight: 600;
        outline: none;
        flex: 1;
        min-width: 200px;
        height: 30px;
    }
</style>

<script lang="ts">
    import { requestStore } from "$lib/stores/request.svelte";

    let isEditingName = $state(false);
    let nameInputRef = $state<HTMLInputElement>();

    const displayName = $derived(
        requestStore.currentApi?.name ?? "Untitled Request",
    );

    function startEditingName() {
        isEditingName = true;
        setTimeout(() => nameInputRef?.select(), 0);
    }

    function finishEditingName() {
        isEditingName = false;
    }

    function handleNameInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        requestStore.setCurrentApiName(value);
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
            <svg class="edit-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
            </svg>
        </button>
    {/if}
</div>

<style>
    .name-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
    }

    .name-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 0.75rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 0.375rem;
        transition: background 0.15s ease;
        min-width: 0;
        height: 40px;
    }

    .name-display:hover {
        background: var(--surface-hover);
    }

    .name-display h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .name-input {
        padding: 0 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        outline: none;
        flex: 1;
        min-width: 200px;
        height: 40px;
    }

    .edit-icon {
        width: 1rem;
        height: 1rem;
        opacity: 0.5;
        transition: opacity 0.15s ease;
        flex-shrink: 0;
    }

    .name-display:hover .edit-icon {
        opacity: 0.85;
    }
</style>

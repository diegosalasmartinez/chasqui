<script lang="ts">
    import SaveSvg from "$lib/assets/icons/save.svg?raw";
    import { apiStore } from "$lib/stores/api.svelte";

    // Update or save api
    async function onSave() {
        await apiStore.upsertApi();
    }
</script>

<div class="save-btn-container">
    {#if apiStore.hasUnsavedChanges}
        <div class="unsaved-changes"></div>
    {/if}
    <button
        type="button"
        class="save-btn icon"
        onclick={() => onSave()}
        title="Save request"
    >
        {@html SaveSvg}
    </button>
</div>

<style>
    .save-btn-container {
        position: relative;
    }

    .icon :global(svg) {
        width: 1rem;
        height: 1rem;
    }

    .unsaved-changes {
        position: absolute;
        background: var(--orange);
        width: 12px;
        height: 12px;
        border-radius: 100%;
        top: -2px;
        left: -2px;
    }
</style>

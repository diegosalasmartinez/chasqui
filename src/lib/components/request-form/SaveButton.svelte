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
        class="save-btn ghost"
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

    .unsaved-changes {
        position: absolute;
        background: var(--orange);
        width: 10px;
        height: 10px;
        border-radius: 100%;
        top: 0px;
        left: -2px;
    }
</style>

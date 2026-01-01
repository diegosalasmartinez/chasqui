<script lang="ts">
    import SaveIcon from "$lib/ui/icons/SaveIcon.svelte";
    import { apiStore } from "$lib/stores/api.svelte";

    async function onSave() {
        await apiStore.saveApi();
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
        <SaveIcon />
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

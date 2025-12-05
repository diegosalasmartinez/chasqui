<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import SavedApis from "$lib/components/SavedApis.svelte";
    import AddSvg from "$lib/assets/icons/add.svg?raw";
</script>

<aside id="left-panel">
    <section class="new-actions">
        <span>Search</span>

        <button
            id="new-dropdown"
            class="ghost"
            onclick={() => apiStore.selectNewRequest()}
        >
            {@html AddSvg}
        </button>
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
        padding: 15px 10px 15px 20px;
        border-bottom: 0.5px solid var(--border);
        font-size: 13px;
        display: flex;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
    }
</style>

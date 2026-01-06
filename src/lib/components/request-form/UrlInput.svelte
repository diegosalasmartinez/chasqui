<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import VariableInput from "$lib/ui/VariableInput.svelte";
</script>

<VariableInput
    class="url-input"
    placeholder="Enter URL"
    value={apiStore.api?.request.url || ""}
    oninput={(e) =>
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                url: e.currentTarget.value,
            },
        }))}
/>

<style>
    :global(.url-input) {
        background: var(--surface);
        color: var(--text-primary);
        flex: 1;
        height: 40px;
        padding: 8px 12px;
        border-radius: 0;
        font-size: 13px;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    }

    :global(.url-input:focus) {
        outline: none;
    }

    :global(.url-input:hover) {
        border: 1px solid var(--border);
    }
</style>

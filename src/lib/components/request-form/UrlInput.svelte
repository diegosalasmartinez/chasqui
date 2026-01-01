<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import VariableInput from "$lib/ui/VariableInput.svelte";
</script>

<VariableInput
    class="url-input"
    placeholder="https://api.example.com/endpoint"
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
        flex: 1;
        height: 40px;
        padding: 6px 12px;
        border-radius: 0;
        font-size: 13px;
        transition: all 0.15s ease;
    }

    :global(.url-input:focus) {
        outline: none;
    }
</style>

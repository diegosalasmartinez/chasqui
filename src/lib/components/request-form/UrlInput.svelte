<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
</script>

<input
    class="url-input"
    type="url"
    placeholder="https://api.example.com/endpoint"
    value={apiStore.api?.request.url}
    oninput={(e) =>
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                url: (e.target as HTMLInputElement).value,
            },
        }))}
/>

<style>
    .url-input {
        flex: 1;
        height: 40px;
        padding: 0.625rem 1rem;
        border-radius: 0;
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
        font-size: 0.9375rem;
        transition: all 0.15s ease;
    }

    .url-input:focus {
        outline: none;
    }
</style>

<script lang="ts">
    import { requestStore } from "$lib/stores/request.svelte";
</script>

<input
    class="url-input"
    type="url"
    placeholder="https://api.example.com/endpoint"
    value={requestStore.request.url}
    oninput={(e) =>
        requestStore.updateRequest((r) => ({
            ...r,
            url: (e.target as HTMLInputElement).value,
        }))}
/>

<style>
    .url-input {
        flex: 1;
        height: 40px;
        padding: 0.625rem 1rem;
        margin-right: 10px;
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

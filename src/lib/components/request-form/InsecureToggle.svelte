<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
</script>

<div class="options-bar">
    <label class="checkbox-label">
        <input
            type="checkbox"
            checked={apiStore.api?.request.insecure}
            onchange={(e) =>
                apiStore.updateApi((a) => ({
                    ...a,
                    request: {
                        ...a.request,
                        insecure: (e.target as HTMLInputElement).checked,
                    },
                }))}
        />
        <span>Allow insecure TLS (development only)</span>
    </label>
</div>

<style>
    .options-bar {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 8px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 0.875rem;
        user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
        cursor: pointer;
        width: 1rem;
        height: 1rem;
    }

    .checkbox-label:hover {
        color: var(--text-primary);
    }
</style>

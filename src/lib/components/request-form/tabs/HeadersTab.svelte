<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import KeyValueEditor from "$lib/ui/KeyValueEditor.svelte";
    import type { HeaderKV } from "$lib/types/http";

    const headers = $derived(apiStore.api?.request.headers);

    function updateHeaders(newHeaders: HeaderKV[]) {
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                headers: newHeaders,
            },
        }));
    }
</script>

{#if headers}
    <KeyValueEditor
        items={headers}
        onUpdate={updateHeaders}
        placeholder={{ key: "Header", value: "Value" }}
        enableVariables
    />
{/if}

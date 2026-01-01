<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import KeyValueEditor from "$lib/ui/KeyValueEditor.svelte";
    import type { QueryParam } from "$lib/types/http";

    const params = $derived(apiStore.api?.request.params);

    function updateParams(newParams: QueryParam[]) {
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                params: newParams,
            },
        }));
    }
</script>

{#if params}
    <KeyValueEditor items={params} onUpdate={updateParams} enableVariables />
{/if}

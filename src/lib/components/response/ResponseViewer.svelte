<script lang="ts">
    import type { Response } from "$lib/types/http";
    import { apiStore } from "$lib/stores/api.svelte";
    import ResponseHeaders from "$lib/components/response/ResponseHeaders.svelte";
    import ResponseStats from "$lib/components/response/ResponseStats.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";
    import JsonViewer from "../JsonViewer.svelte";

    interface Props {
        response?: Response;
    }

    let { response: propResponse }: Props = $props();

    let activeTab = $state<"body" | "headers">("body");

    const response = $derived(propResponse ?? apiStore.currentResponse);
    const headers = $derived(response?.headers);
    const body = $derived(response?.body);
</script>

{#if response}
    <section class="response">
        <div class="header">
            <div class="tabs" role="tablist" aria-label="Response content">
                <TabButton
                    text="Body"
                    isActive={activeTab === "body"}
                    onClick={() => (activeTab = "body")}
                />
                <TabButton
                    text="Headers"
                    isActive={activeTab === "headers"}
                    onClick={() => (activeTab = "headers")}
                />
            </div>

            <ResponseStats {response} />
        </div>

        <div role="tabpanel" class="panel">
            {#if activeTab === "body"}
                <JsonViewer value={body} />
            {:else}
                <ResponseHeaders headers={headers ?? []} />
            {/if}
        </div>
    </section>
{/if}

<style>
    .response {
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .header {
        background: var(--bg-darker);
        border-bottom: 0.5px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        padding: 0 10px;
        flex: 0 0 auto;
    }

    .panel {
        padding: 5px 10px;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
</style>

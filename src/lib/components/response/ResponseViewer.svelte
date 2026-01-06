<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import ResponseLoading from "$lib/components/response/ResponseLoading.svelte";
    import ResponseHeaders from "$lib/components/response/ResponseHeaders.svelte";
    import ResponseStats from "$lib/components/response/ResponseStats.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";
    import JsonViewer from "../JsonViewer.svelte";

    let activeTab = $state<"body" | "headers">("body");

    const body = $derived(apiStore.currentResponse?.body);
    const headers = $derived(apiStore.currentResponse?.headers);
</script>

{#if apiStore.currentResponse}
    {#if apiStore.currentResponseLoading}
        <ResponseLoading />
    {:else}
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

                <ResponseStats />
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
{/if}

<style>
    .response {
        height: 100dvh;
        display: flex;
        flex-direction: column;
        min-height: 0;
        border-right: 0.5px solid var(--border);
        border-bottom: 0.5px solid var(--border);
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

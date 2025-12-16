<script lang="ts">
    import CopySvg from "$lib/assets/icons/copy.svg?raw";
    import type { Response } from "$lib/types/http";
    import { apiStore } from "$lib/stores/api.svelte";
    import { copyToClipboard } from "$lib/utils/common";
    import ResponseLoading from "$lib/components/response/ResponseLoading.svelte";
    import ResponseStats from "$lib/components/response/ResponseStats.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";

    let activeTab = $state<"body" | "headers">("body");

    const getPrettyHeaders = (res: Response | null) => {
        if (!res) return "";
        return JSON.stringify(res.headers ?? {}, null, 2);
    };

    const { headersPretty } = $derived.by(() => ({
        headersPretty: getPrettyHeaders(apiStore.currentResponse),
    }));

    const body = $derived(apiStore.currentResponse?.body);
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
                    <div class="code-wrapper">
                        <button
                            class="copy-btn"
                            title="Copy"
                            onclick={() => copyToClipboard(body)}
                        >
                            {@html CopySvg}
                        </button>
                        <pre class="code"><code>{body}</code></pre>
                    </div>
                {:else}
                    <div>{headersPretty}</div>
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

    .code-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .code {
        background: var(--surface);
        color: white;
        padding: 12px;
        border-radius: 10px;
        max-height: 360px;
        overflow: auto;
        white-space: pre;
        tab-size: 2;
    }

    pre {
        margin: 0;
    }

    .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        display: none;
        border: none;
        border-radius: 6px;
        padding: 4px 6px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
    }

    .code-wrapper:hover .copy-btn {
        display: block;
    }
</style>

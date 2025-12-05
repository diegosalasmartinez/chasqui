<script lang="ts">
    import CopySvg from "$lib/assets/icons/copy.svg?raw";
    import type { Response } from "$lib/types/http";
    import { copyToClipboard } from "$lib/utils/common";
    import { apiStore } from "$lib/stores/api.svelte";
    import ResponseStats from "$lib/components/response/ResponseStats.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";

    let activeTab = $state<"body" | "headers">("body");

    const getPrettyBody = (res: Response | null) => {
        try {
            const buf = new Uint8Array(res?.body as any);
            const rawBody = new TextDecoder().decode(buf);
            const pretty = JSON.stringify(JSON.parse(rawBody), null, 2);

            return pretty || rawBody;
        } catch {
            return "";
        }
    };

    const getPrettyHeaders = (res: Response | null) => {
        if (!res) return "";
        return JSON.stringify(res.headers ?? {}, null, 2);
    };

    const { response, bodyPretty, headersPretty } = $derived.by(() => ({
        response: apiStore.currentResponse,
        bodyPretty: getPrettyBody(apiStore.currentResponse),
        headersPretty: getPrettyHeaders(apiStore.currentResponse),
    }));
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

            <ResponseStats />
        </div>

        <div role="tabpanel" class="panel">
            <div class="code-wrapper">
                <button
                    class="copy-btn"
                    title="Copy"
                    onclick={() =>
                        copyToClipboard(
                            activeTab === "body" ? bodyPretty : headersPretty,
                        )}
                >
                    {@html CopySvg}
                </button>
                <pre class="code"><code
                        >{activeTab === "body"
                            ? bodyPretty
                            : headersPretty}</code
                    ></pre>
            </div>
        </div>
    </section>
{/if}

<style>
    .response {
        padding: 14px 0;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
    }

    .panel {
        margin-top: 10px;
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

    .code-wrapper {
        position: relative;
        width: 100%;
        display: inline-block;
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

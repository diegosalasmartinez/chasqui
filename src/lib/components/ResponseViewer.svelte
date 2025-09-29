<script lang="ts">
    import { response } from "$lib/stores/request";
    import { copyToClipboard } from "$lib/utils/common";
    import CopySvg from "$lib/assets/icons/copy.svg?raw";
    import TabButton from "$lib/ui/TabButton.svelte";
    import ResponseStats from "./ResponseStats.svelte";

    let pretty = "";
    let rawBody = "";
    let activeTab: "body" | "headers" = "body";

    // Prettify if body is JSON
    $: if ($response) {
        try {
            const buf = new Uint8Array($response.body as any);
            rawBody = new TextDecoder().decode(buf);
            pretty = JSON.stringify(JSON.parse(rawBody), null, 2);
        } catch {
            pretty = rawBody;
        }
    }

    $: headersPretty = $response
        ? JSON.stringify($response.headers ?? {}, null, 2)
        : "";
</script>

{#if $response}
    <section class="response_section">
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
                    on:click={() =>
                        copyToClipboard(
                            activeTab === "body"
                                ? rawBody || pretty
                                : headersPretty,
                        )}
                >
                    {@html CopySvg}
                </button>
                <pre class="code"><code
                        >{activeTab === "body" ? pretty : headersPretty}</code
                    ></pre>
            </div>
        </div>
    </section>
{/if}

<style>
    .response_section {
        padding: 14px 0;
    }

    .tabs {
        display: inline-flex;
        gap: 4px;
        margin-top: 6px;
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
        max-width: 100%;
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

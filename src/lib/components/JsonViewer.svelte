<script lang="ts">
    import { tick } from "svelte";
    import CopyIcon from "$lib/ui/icons/CopyIcon.svelte";
    import { copyToClipboard } from "$lib/utils/common";

    interface Props {
        value: unknown;
        indent?: number;
    }

    let { value, indent = 2 }: Props = $props();

    // Cache for highlighted HTML (keyed by raw value reference or hash)
    const highlightCache = new Map<string, string>();
    const MAX_CACHE_SIZE = 20;

    let isProcessing = $state(true);
    let formattedText = $state("");
    let highlightedHtml = $state("");
    let isJson = $state(false);

    function getCacheKey(v: unknown): string {
        if (typeof v === "string") return v.slice(0, 1000);
        return JSON.stringify(v).slice(0, 1000);
    }

    function tryFormatJson(v: unknown): { text: string; isJson: boolean } {
        if (v !== null && typeof v === "object") {
            return { text: JSON.stringify(v, null, indent), isJson: true };
        }
        if (typeof v === "string") {
            const trimmed = v.trim();
            if (!trimmed) return { text: "", isJson: false };
            try {
                const parsed = JSON.parse(trimmed);
                return {
                    text: JSON.stringify(parsed, null, indent),
                    isJson: true,
                };
            } catch {
                return { text: v, isJson: false };
            }
        }
        return { text: String(v ?? ""), isJson: false };
    }

    function highlightJson(json: string): string {
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = "number";
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = "key";
                    } else {
                        cls = "string";
                    }
                } else if (/true|false/.test(match)) {
                    cls = "boolean";
                } else if (/null/.test(match)) {
                    cls = "null";
                }
                return `<span class="${cls}">${match}</span>`;
            },
        );
    }

    function addToCache(key: string, html: string) {
        if (highlightCache.size >= MAX_CACHE_SIZE) {
            const firstKey = highlightCache.keys().next().value;
            if (firstKey) highlightCache.delete(firstKey);
        }
        highlightCache.set(key, html);
    }

    async function processValue(v: unknown) {
        isProcessing = true;

        const cacheKey = getCacheKey(v);
        const cached = highlightCache.get(cacheKey);

        if (cached !== undefined) {
            const formatted = tryFormatJson(v);
            formattedText = formatted.text;
            isJson = formatted.isJson;
            highlightedHtml = cached;
            isProcessing = false;
            return;
        }

        // Yield to let UI render first
        await tick();
        await new Promise(resolve => requestAnimationFrame(resolve));

        const formatted = tryFormatJson(v);
        formattedText = formatted.text;
        isJson = formatted.isJson;

        if (formatted.isJson) {
            const html = highlightJson(formatted.text);
            highlightedHtml = html;
            addToCache(cacheKey, html);
        } else {
            highlightedHtml = "";
            addToCache(cacheKey, "");
        }

        isProcessing = false;
    }

    $effect(() => {
        processValue(value);
    });
</script>

<div class="code-wrapper">
    {#if isProcessing}
        <div class="loading">
            <span class="loading-text">Loading response...</span>
        </div>
    {:else}
        <button
            class="copy-btn ghost"
            title="Copy"
            onclick={() => copyToClipboard(formattedText)}
        >
            <CopyIcon size={14} />
        </button>
        <pre class="code"><code>{#if isJson}{@html highlightedHtml}{:else}{formattedText}{/if}</code></pre>
    {/if}
</div>

<style>
    .code-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        background: var(--surface);
        border-radius: 10px;
    }

    .loading-text {
        font-size: 13px;
        color: var(--text-secondary);
    }

    .code {
        background: var(--surface);
        color: white;
        padding: 12px;
        border-radius: 10px;
        overflow: auto;
        white-space: pre;
        tab-size: 2;
        margin: 0;
        font-family: "Consolas", "Monaco", "Courier New", monospace;
        font-size: 13px;
        line-height: 1.5;
    }

    /* TODO: Update this colors for white mode */
    .code :global(.key) {
        color: #9cdcfe;
    }

    .code :global(.string) {
        color: #ce9178;
    }

    .code :global(.number) {
        color: #b5cea8;
    }

    .code :global(.boolean) {
        color: #569cd6;
    }

    .code :global(.null) {
        color: #569cd6;
    }

    .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        display: none;
        border: none;
        border-radius: 6px;
        padding: 6px 8px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        transition: background 0.2s;
    }

    .copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .code-wrapper:hover .copy-btn {
        display: block;
    }
</style>

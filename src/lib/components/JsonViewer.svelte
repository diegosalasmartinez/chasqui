<script lang="ts">
    import CopySvg from "$lib/assets/icons/copy.svg?raw";
    import { copyToClipboard } from "$lib/utils/common";

    export let value: unknown;
    export let indent = 2;

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

    $: formatted = tryFormatJson(value);
    $: highlighted = formatted.isJson
        ? highlightJson(formatted.text)
        : formatted.text;
</script>

<div class="code-wrapper">
    <button
        class="copy-btn ghost"
        title="Copy"
        onclick={() => copyToClipboard(formatted.text)}
    >
        {@html CopySvg}
    </button>
    <pre class="code"><code
            >{#if formatted.isJson}{@html highlighted}{:else}{formatted.text}{/if}</code
        ></pre>
</div>

<style>
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

    .copy-btn :global(svg) {
        width: 14px;
        height: 14px;
    }

    .copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .code-wrapper:hover .copy-btn {
        display: block;
    }
</style>


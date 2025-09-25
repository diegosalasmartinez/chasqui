<script lang="ts">
    import { response } from "$lib/stores/request";
    import { copyToClipboard, fmtMs, fmtBytes } from "$lib/utils/common";

    let pretty = "";
    let rawBody = "";
    let activeTab: "body" | "headers" = "body";

    const statusTint = (code?: number) => {
        if (typeof code !== "number") return "neutral";
        if (code >= 200 && code < 300) return "ok";
        if (code >= 300 && code < 400) return "info";
        if (code >= 400 && code < 500) return "warn";
        return "err";
    };

    // Prettify del body si es JSON, si no, texto plano
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
    <section class="card">
        <header class="card__head">
            <!-- Tabs -->
            <div class="tabs" role="tablist" aria-label="Response content">
                <button
                    role="tab"
                    class="tab {activeTab === 'body' ? 'active' : ''}"
                    aria-selected={activeTab === "body"}
                    tabindex={activeTab === "body" ? 0 : -1}
                    on:click={() => (activeTab = "body")}
                >
                    Body
                </button>
                <button
                    role="tab"
                    class="tab {activeTab === 'headers' ? 'active' : ''}"
                    aria-selected={activeTab === "headers"}
                    tabindex={activeTab === "headers" ? 0 : -1}
                    on:click={() => (activeTab = "headers")}
                >
                    Headers
                </button>
            </div>

            <!-- Meta -->
            <div class="meta">
                <span class="badge {statusTint($response.status)}">
                    Status: {$response.status}
                </span>
                <span class="dot">•</span>
                <span class="pill">
                    Time: {fmtMs($response.duration_ms)}
                </span>
                <span class="dot">•</span>
                <span class="pill">
                    Size: {fmtBytes($response.size_bytes)}
                </span>
            </div>
        </header>

        <!-- Panels -->
        {#if activeTab === "body"}
            <div role="tabpanel" class="panel">
                <div class="panel__bar">
                    <div class="actions">
                        <button
                            class="btn"
                            on:click={() => copyToClipboard(rawBody || pretty)}
                        >
                            Copy
                        </button>
                    </div>
                </div>
                <pre class="code code--dark"><code>{pretty}</code></pre>
            </div>
        {:else}
            <div role="tabpanel" class="panel">
                <div class="panel__bar">
                    <div class="actions">
                        <button
                            class="btn"
                            on:click={() => copyToClipboard(headersPretty)}
                        >
                            Copy
                        </button>
                    </div>
                </div>
                <pre class="code code--dark"><code>{headersPretty}</code></pre>
            </div>
        {/if}
    </section>
{/if}

<style>
    /* Layout base */
    .card {
        border: 1px solid #e7e9ef;
        border-radius: 14px;
        padding: 14px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    }

    .card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
    }

    .meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .dot {
        color: #94a3b8;
    }

    .badge,
    .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #0f172a;
    }

    .badge.ok {
        background: #ecfdf5;
        border-color: #bbf7d0;
        color: #14532d;
    }
    .badge.info {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1e3a8a;
    }
    .badge.warn {
        background: #fff7ed;
        border-color: #fed7aa;
        color: #7c2d12;
    }
    .badge.err {
        background: #fef2f2;
        border-color: #fecaca;
        color: #7f1d1d;
    }

    /* Tabs */
    .tabs {
        display: inline-flex;
        gap: 6px;
        margin-top: 6px;
        border: 1px solid #e7e9ef;
        border-radius: 10px;
        padding: 4px;
        background: #f8fafc;
    }

    .tab {
        border: 0;
        background: transparent;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
    }
    .tab:hover {
        background: #e2e8f0;
    }
    .tab.active {
        background: #fff;
        box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
        color: #0f172a;
    }

    /* Panel */
    .panel {
        margin-top: 10px;
    }

    .panel__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .actions {
        display: flex;
        gap: 8px;
    }

    .btn {
        appearance: none;
        border: 1px solid #e7e9ef;
        background: #fff;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
        color: #0f172a;
        cursor: pointer;
    }
    .btn:hover {
        background: #f8fafc;
    }

    /* Code blocks */
    .code {
        background: #f7f7f7;
        color: #111827;
        padding: 12px;
        border-radius: 10px;
        max-height: 360px;
        overflow: auto;
        white-space: pre;
        tab-size: 2;
    }
    .code--dark {
        background: #0b1020;
        color: #cfe3ff;
    }

    pre {
        margin: 0;
    }
</style>

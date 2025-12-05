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
    <div class="tab-content">
        <KeyValueEditor
            items={headers}
            onUpdate={updateHeaders}
            placeholder={{ key: "Header", value: "Value" }}
        />

        <div class="common-headers">
            <p class="section-title">Common Headers</p>
            <div class="header-chips">
                <button
                    type="button"
                    class="chip"
                    onclick={() =>
                        updateHeaders([
                            ...headers,
                            {
                                key: "Content-Type",
                                value: "application/json",
                                enabled: true,
                            },
                        ])}
                >
                    Content-Type: application/json
                </button>
                <button
                    type="button"
                    class="chip"
                    onclick={() =>
                        updateHeaders([
                            ...headers,
                            {
                                key: "Accept",
                                value: "application/json",
                                enabled: true,
                            },
                        ])}
                >
                    Accept: application/json
                </button>
                <button
                    type="button"
                    class="chip"
                    onclick={() =>
                        updateHeaders([
                            ...headers,
                            {
                                key: "User-Agent",
                                value: "Chasqui/1.0",
                                enabled: true,
                            },
                        ])}
                >
                    User-Agent: Chasqui/1.0
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .tab-content {
        padding: 16px;
    }

    .common-headers {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
    }

    .section-title {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .header-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .chip {
        padding: 6px 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        color: var(--text-primary);
        font-size: 12px;
        font-family: "SF Mono", "Monaco", "Consolas", monospace;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .chip:hover {
        background: var(--hover);
        border-color: var(--accent);
    }
</style>

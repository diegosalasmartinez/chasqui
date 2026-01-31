<script lang="ts">
    import type { Request } from "$lib/types/http";
    import { COLORS } from "$lib/constants/http.constants";
    import JsonViewer from "$lib/components/JsonViewer.svelte";
    import DataTable from "$lib/ui/DataTable.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";

    interface Props {
        request: Request;
        timestamp?: number;
    }

    let { request, timestamp }: Props = $props();

    type Tabs = "params" | "auth" | "headers" | "body";
    let activeTab = $state<Tabs>("params");

    const tabs: { key: Tabs; title: string }[] = [
        { key: "params", title: "Params" },
        { key: "auth", title: "Authorization" },
        { key: "headers", title: "Headers" },
        { key: "body", title: "Body" },
    ];

    function formatTime(atMs: number): string {
        return new Date(atMs).toLocaleString();
    }

    function getRequestName(url: string): string {
        try {
            const u = new URL(url);
            return u.pathname || "/";
        } catch {
            return url;
        }
    }

    const requestName = $derived(getRequestName(request.url));
    const enabledParams = $derived(request.params.filter((p) => p.enabled));
    const enabledHeaders = $derived(request.headers.filter((h) => h.enabled));
</script>

<div class="request-viewer">
    <div class="header-bar">
        <div class="request-name">
            <span class="method" style:color={COLORS[request.method]}
                >{request.method}</span
            >
            <span class="name">{requestName}</span>
        </div>
        {#if timestamp}
            <span class="timestamp">{formatTime(timestamp)}</span>
        {/if}
    </div>

    <div class="request-bar">
        <span class="method" style:color={COLORS[request.method]}>
            {request.method}
        </span>
        <span class="url">{request.url}</span>
    </div>

    <div class="tabs-container">
        <div class="tabs" role="tablist">
            {#each tabs as tab}
                <TabButton
                    text={tab.title}
                    isActive={activeTab === tab.key}
                    onClick={() => (activeTab = tab.key)}
                />
            {/each}
        </div>
    </div>

    <div class="tab-content">
        {#if activeTab === "params"}
            <DataTable
                columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }]}
                rows={enabledParams}
                emptyMessage="No query parameters"
            />
        {:else if activeTab === "auth"}
            <div class="auth-info">
                {#if request.auth.type === "none"}
                    <p class="empty">No authentication</p>
                {:else if request.auth.type === "bearer"}
                    <div class="auth-row">
                        <span class="auth-label">Type:</span>
                        <span>Bearer Token</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Token:</span>
                        <span class="auth-value">{request.auth.token}</span>
                    </div>
                {:else if request.auth.type === "basic"}
                    <div class="auth-row">
                        <span class="auth-label">Type:</span>
                        <span>Basic Auth</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Username:</span>
                        <span>{request.auth.username}</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Password:</span>
                        <span class="auth-value">••••••••</span>
                    </div>
                {:else if request.auth.type === "api-key"}
                    <div class="auth-row">
                        <span class="auth-label">Type:</span>
                        <span>API Key</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Key:</span>
                        <span>{request.auth.key}</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Value:</span>
                        <span class="auth-value">{request.auth.value}</span>
                    </div>
                    <div class="auth-row">
                        <span class="auth-label">Add to:</span>
                        <span>{request.auth.addTo}</span>
                    </div>
                {/if}
            </div>
        {:else if activeTab === "headers"}
            <DataTable
                columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }]}
                rows={enabledHeaders}
                emptyMessage="No headers"
            />
        {:else if activeTab === "body"}
            {#if request.body.type === "none"}
                <p class="empty">No body</p>
            {:else if request.body.type === "json"}
                <JsonViewer value={request.body.content} />
            {:else if request.body.type === "text"}
                <pre class="body-text">{request.body.content}</pre>
            {:else if request.body.type === "form-data" || request.body.type === "x-www-form-urlencoded"}
                <DataTable
                    columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }]}
                    rows={request.body.data.filter((d) => d.enabled)}
                />
            {/if}
        {/if}
    </div>
</div>

<style>
    .request-viewer {
        border-right: 0.5px solid var(--border);
        background: var(--bg-darker);
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
    }

    .header-bar {
        margin: 5px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        height: 40px;
    }

    .request-name {
        display: flex;
        align-items: center;
        padding-left: 12px;
        padding-right: 12px;
        gap: 8px;
        min-width: 0;
    }

    .request-name .method {
        font-size: 16px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .request-name .name {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .timestamp {
        font-size: 12px;
        color: var(--text-secondary);
    }

    .request-bar {
        margin: 0 10px;
        display: flex;
        align-items: center;
        gap: 12.5px;
        padding: 10px 12px;
        background: var(--surface);
        border-radius: 8px;
        border: 1px solid transparent;
        height: 40px;
    }

    .method {
        font-size: 12px;
        letter-spacing: 0.025em;
        font-weight: 600;
        flex-shrink: 0;
    }

    .url {
        font-size: 13px;
        color: var(--text-primary);
        word-break: break-all;
    }

    .tabs-container {
        border-bottom: 0.5px solid var(--border);
    }

    .tabs {
        margin: 5px 10px 0px 10px;
    }

    .tab-content {
        background: var(--bg-darker);
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        min-height: 0;
    }

    .empty {
        color: var(--text-secondary);
        font-size: 13px;
        margin: 0;
    }

    .auth-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .auth-row {
        display: flex;
        gap: 12px;
        font-size: 13px;
    }

    .auth-label {
        color: var(--text-secondary);
        min-width: 80px;
    }

    .auth-value {
        color: var(--text-primary);
        word-break: break-all;
    }

    .body-text {
        margin: 0;
        font-size: 13px;
        white-space: pre-wrap;
        word-break: break-all;
        color: var(--text-primary);
    }
</style>

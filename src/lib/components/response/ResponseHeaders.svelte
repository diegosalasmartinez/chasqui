<script lang="ts">
    import CopyIcon from "$lib/ui/icons/CopyIcon.svelte";
    import type { HeaderKV } from "$lib/types/http";
    import { copyToClipboard } from "$lib/utils/common";

    let { headers }: { headers: HeaderKV[] } = $props();
</script>

<div class="headers-table">
    <div class="headers-header">
        <div class="col-key">KEY</div>
        <div class="col-value">VALUE</div>
        <div class="col-actions"></div>
    </div>

    {#each headers as header}
        <div class="header-row">
            <div class="col-key">
                <span class="header-text">{header.key}</span>
            </div>
            <div class="col-value">
                <span class="header-text">{header.value}</span>
            </div>
            <div class="col-actions">
                <button
                    class="copy-btn ghost"
                    title="Copy value"
                    onclick={() => copyToClipboard(header.value)}
                >
                    <CopyIcon size={14} />
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
    .headers-table {
        border: 1px solid var(--border);
        border-radius: 6px;
        overflow: auto;
        background: var(--bg);
        font-size: 14px;
    }

    .headers-header {
        display: grid;
        grid-template-columns: 1fr 2fr 32px;
        gap: 0;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
    }

    .headers-header div {
        padding-left: 12px;
    }

    .header-row {
        display: grid;
        grid-template-columns: 1fr 2fr 32px;
        gap: 0;
        border-bottom: 1px solid var(--border);
        transition: background 0.1s ease;
    }

    .header-row:last-child {
        border-bottom: none;
    }

    .header-row:hover {
        background: var(--hover);
    }

    .col-key,
    .col-value {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        min-height: 36px;
    }

    .col-key {
        border-right: 1px solid var(--border);
        font-weight: 500;
    }

    .header-text {
        font-size: 13px;
        color: var(--text-primary);
        word-break: break-word;
    }

    .col-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
    }

    .copy-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: auto;
        padding: 4px;
        border: none;
        background: transparent;
        border-radius: 4px;
        opacity: 0;
        transition: all 0.15s ease;
        color: var(--text-secondary);
        cursor: pointer;
    }

    .header-row:hover .copy-btn {
        opacity: 0.6;
    }

    .copy-btn:hover {
        opacity: 1 !important;
        color: var(--blue);
        background: var(--hover);
    }
</style>

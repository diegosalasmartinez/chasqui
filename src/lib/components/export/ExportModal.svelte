<script lang="ts">
    import { exportModalStore } from "$lib/stores/exportModal.svelte";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import { copyToClipboard } from "$lib/utils/common";
    import {
        exportRequest,
        getFormatName,
        EXPORT_FORMATS,
    } from "$lib/utils/export";
    import type { ExportFormat } from "$lib/types/export";
    import CopyIcon from "$lib/ui/icons/CopyIcon.svelte";
    import Modal from "$lib/ui/Modal.svelte";

    let selectedFormat = $state<ExportFormat>("curl");

    const exportedCode = $derived(() => {
        if (!exportModalStore.request) return "";
        try {
            const variables = environmentStore.variablesMap;
            return exportRequest(exportModalStore.request, selectedFormat, {
                variables,
            });
        } catch (e) {
            return `Error: ${e instanceof Error ? e.message : "Failed to export"}`;
        }
    });

    function handleClose() {
        exportModalStore.close();
        selectedFormat = "curl";
    }
</script>

<Modal
    open={exportModalStore.open}
    title="Export Request"
    onClose={handleClose}
>
    <div class="export-modal">
        <div class="format-selector">
            <span>Format</span>
            <select bind:value={selectedFormat}>
                {#each EXPORT_FORMATS as format}
                    <option value={format}>{getFormatName(format)}</option>
                {/each}
            </select>
        </div>

        <div class="code-wrapper">
            <button
                class="copy-btn ghost"
                title="Copy"
                onclick={() => copyToClipboard(exportedCode())}
            >
                <CopyIcon size={14} />
            </button>
            <pre class="code-output">{exportedCode()}</pre>
        </div>
    </div>
</Modal>

<style>
    .export-modal {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 550px;
    }

    .format-selector {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .format-selector span {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .format-selector select {
        flex: 1;
        max-width: 200px;
    }

    .code-wrapper {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
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
        z-index: 1;
    }

    .copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .code-wrapper:hover .copy-btn {
        display: block;
    }

    .code-output {
        margin: 0;
        padding: 16px;
        background: var(--surface);
        font-family: "Consolas", "Monaco", "Courier New", monospace;
        font-size: 13px;
        line-height: 1.5;
        color: var(--text-primary);
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 400px;
        overflow-y: auto;
    }
</style>

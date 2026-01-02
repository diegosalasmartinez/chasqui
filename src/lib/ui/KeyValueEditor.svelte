<script lang="ts">
    import type { KeyValuePair } from "$lib/types/http";
    import PlusIcon from "$lib/ui/icons/PlusIcon.svelte";
    import CloseIcon from "$lib/ui/icons/CloseIcon.svelte";
    import VariableInput from "$lib/ui/VariableInput.svelte";

    interface Props {
        items: KeyValuePair[];
        onUpdate: (items: KeyValuePair[]) => void;
        placeholder?: { key: string; value: string };
        enableVariables?: boolean;
    }

    let {
        items,
        onUpdate,
        placeholder = { key: "Key", value: "Value" },
        enableVariables = false,
    }: Props = $props();

    function addRow() {
        onUpdate([...items, { key: "", value: "", enabled: true }]);
    }

    function updateKey(index: number, key: string) {
        const updated = [...items];
        updated[index] = { ...updated[index], key };
        onUpdate(updated);
    }

    function updateValue(index: number, value: string) {
        const updated = [...items];
        updated[index] = { ...updated[index], value };
        onUpdate(updated);
    }

    function toggleEnabled(index: number) {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            enabled: !updated[index].enabled,
        };
        onUpdate(updated);
    }

    function removeRow(index: number) {
        const updated = items.filter((_, i) => i !== index);
        onUpdate(updated);
    }
</script>

<div class="kv-editor">
    <div class="kv-table">
        <div class="kv-header">
            <div class="col-checkbox"></div>
            <div class="col-key">KEY</div>
            <div class="col-value">VALUE</div>
            <div class="col-actions"></div>
        </div>

        {#each items as item, i}
            <div class="kv-row" class:disabled={!item.enabled}>
                <div class="col-checkbox">
                    <input
                        type="checkbox"
                        checked={item.enabled}
                        onchange={() => toggleEnabled(i)}
                    />
                </div>
                <div class="col-key">
                    <input
                        type="text"
                        class="kv-input"
                        placeholder={placeholder.key}
                        value={item.key}
                        oninput={(e) =>
                            updateKey(i, (e.target as HTMLInputElement).value)}
                        disabled={!item.enabled}
                    />
                </div>
                <div class="col-value">
                    {#if enableVariables}
                        <VariableInput
                            class="kv-input"
                            placeholder={placeholder.value}
                            value={item.value}
                            disabled={!item.enabled}
                            oninput={(e) =>
                                updateValue(i, e.currentTarget.value)}
                        />
                    {:else}
                        <input
                            type="text"
                            class="kv-input"
                            placeholder={placeholder.value}
                            value={item.value}
                            oninput={(e) =>
                                updateValue(
                                    i,
                                    (e.target as HTMLInputElement).value,
                                )}
                            disabled={!item.enabled}
                        />
                    {/if}
                </div>
                <div class="col-actions">
                    <button
                        type="button"
                        class="btn-remove"
                        onclick={() => removeRow(i)}
                        aria-label="Remove row"
                    >
                        <CloseIcon size={14} />
                    </button>
                </div>
            </div>
        {/each}
    </div>

    <button type="button" class="btn-add" onclick={addRow}>
        <PlusIcon size={16} />
        <span>Add {items.length === 0 ? placeholder.key : "Row"}</span>
    </button>
</div>

<style>
    .kv-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 14px;
    }

    .kv-table {
        border: 1px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
        background: var(--bg);
    }

    .kv-header {
        display: grid;
        grid-template-columns: 32px 1fr 1fr 32px;
        gap: 0;
        padding: 8px 0;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
    }

    .kv-header div {
        border: none !important;
        padding-left: 10px;
    }

    .kv-row {
        display: grid;
        grid-template-columns: 32px 1fr 1fr 32px;
        gap: 0;
        border-bottom: 1px solid var(--border);
        transition: background 0.1s ease;
    }

    .kv-row:last-child {
        border-bottom: none;
    }

    .kv-row:hover {
        background: var(--hover);
    }

    .kv-row.disabled {
        opacity: 0.5;
    }

    .col-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
        border-right: 1px solid var(--border);
    }

    .col-checkbox input[type="checkbox"] {
        cursor: pointer;
        width: 14px;
        height: 14px;
        margin: 0;
    }

    .col-key,
    .col-value {
        display: flex;
        align-items: center;
        padding: 0;
        width: 100%;
    }

    .col-key {
        border-right: 1px solid var(--border);
    }

    :global(.kv-input) {
        width: 100% !important;
        border-radius: 0 !important;
        padding: 8px 12px;
        background: transparent;
        border: none;
        font-size: 13px;
        color: var(--text-primary);
        box-shadow: none;
        transition: background 0.1s ease;
    }

    :global(.kv-input:focus) {
        outline: none;
        background: var(--bg-darker);
    }

    :global(.kv-input:disabled) {
        cursor: not-allowed;
        opacity: 0.6;
    }

    :global(.kv-input::placeholder) {
        color: var(--text-secondary);
        opacity: 0.5;
    }

    .col-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
    }

    .btn-remove {
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

    .kv-row:hover .btn-remove {
        opacity: 0.6;
    }

    .btn-remove:hover {
        opacity: 1 !important;
        color: var(--red);
        background: var(--red-hover);
    }

    .btn-add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 0;
        background: transparent;
        border: 1px dashed var(--border);
        border-radius: 6px;
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-add:hover {
        background: var(--hover);
        border-color: var(--blue);
        color: var(--blue);
    }
</style>

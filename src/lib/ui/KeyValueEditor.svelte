<script lang="ts">
    import type { KeyValuePair } from "$lib/types/http";

    interface Props {
        items: KeyValuePair[];
        onUpdate: (items: KeyValuePair[]) => void;
        placeholder?: { key: string; value: string };
    }

    let {
        items,
        onUpdate,
        placeholder = { key: "Key", value: "Value" },
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
    {#if items.length > 0}
        <div class="kv-header">
            <div class="col-key">KEY</div>
            <div class="col-value">VALUE</div>
            <div class="col-checkbox"></div>
            <div class="col-actions"></div>
        </div>

        {#each items as item, i}
            <div class="kv-row" class:disabled={!item.enabled}>
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
                </div>
                <div class="col-checkbox">
                    <input
                        type="checkbox"
                        checked={item.enabled}
                        onchange={() => toggleEnabled(i)}
                    />
                </div>
                <div class="col-actions">
                    <button
                        type="button"
                        class="btn-remove ghost"
                        onclick={() => removeRow(i)}
                        aria-label="Remove row"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        {/each}
    {/if}

    <button type="button" class="btn-add" onclick={addRow}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
            />
        </svg>
        <span>Add {items.length === 0 ? placeholder.key : "Row"}</span>
    </button>
</div>

<style>
    .kv-editor {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
    }

    .kv-header {
        display: grid;
        grid-template-columns: 1fr 1fr 40px 40px;
        gap: 8px;
        padding: 8px 0;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .kv-row {
        display: grid;
        grid-template-columns: 1fr 1fr 40px 40px;
        gap: 8px;
        padding: 0;
        border-radius: 4px;
        transition: background 0.15s ease;
    }

    .kv-row.disabled {
        opacity: 0.5;
    }

    .col-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .col-checkbox input[type="checkbox"] {
        cursor: pointer;
        width: 16px;
        height: 16px;
    }

    .col-key,
    .col-value {
        display: flex;
        align-items: center;
    }

    .kv-input {
        width: 100%;
        padding: 6px 10px;
        background: var(--bg);
        border-radius: 4px;
        border: 1px solid var(--border);
        box-shadow: none;
        font-size: 13px;
        transition: all 0.15s ease;
    }

    .kv-input:hover,
    .kv-input:active,
    .kv-input:focus {
        background: var(--surface);
        border: 1px solid var(--border);
    }

    .kv-input:focus {
        outline: none;
        border-color: var(--accent);
    }

    .kv-input:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .col-actions {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.6;
        transition: all 0.15s ease;
        color: var(--text-secondary);
    }

    .kv-row:hover .btn-remove {
        opacity: 1;
    }

    .btn-remove:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }

    .btn-remove svg {
        width: 16px;
        height: 16px;
    }

    .btn-add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 0;
        margin-top: 4px;
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
        border-color: var(--accent);
        color: var(--accent);
    }

    .btn-add svg {
        width: 18px;
        height: 18px;
    }
</style>

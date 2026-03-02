<script lang="ts">
    import type { EnvVariable } from "$lib/types/http";
    import CloseIcon from "$lib/ui/icons/CloseIcon.svelte";
    import ResetIcon from "$lib/ui/icons/ResetIcon.svelte";

    type Props = {
        variable: EnvVariable;
        onUpdateKey: (key: string) => void;
        onUpdateValue: (value: string) => void;
        onUpdateInitialValue: (val: string) => void;
        onReset: () => void;
        onRemove: () => void;
    };

    let {
        variable,
        onUpdateKey,
        onUpdateValue,
        onUpdateInitialValue,
        onReset,
        onRemove,
    }: Props = $props();

    const changed = $derived(
        !!variable.initial_value && variable.value !== variable.initial_value,
    );
</script>

<div class="kv-row" class:changed>
    <div class="col-key">
        <input
            type="text"
            class="kv-input"
            placeholder="Variable name"
            value={variable.key}
            oninput={(e) => onUpdateKey(e.currentTarget.value)}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
        />
    </div>
    <div class="col-initial">
        <input
            type="text"
            class="kv-input"
            placeholder="Initial value"
            value={variable.initial_value || ""}
            oninput={(e) => onUpdateInitialValue(e.currentTarget.value)}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
        />
    </div>
    <div class="col-value">
        <input
            type="text"
            class="kv-input"
            placeholder="Value"
            value={variable.value}
            oninput={(e) => onUpdateValue(e.currentTarget.value)}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
        />
    </div>
    <div class="col-actions">
        {#if changed}
            <button
                type="button"
                class="btn-reset"
                onclick={onReset}
                aria-label="Reset to initial value"
                title="Reset to initial value"
            >
                <ResetIcon size={14} />
            </button>
        {/if}
        <button
            type="button"
            class="btn-remove"
            onclick={onRemove}
            aria-label="Remove row"
        >
            <CloseIcon size={14} />
        </button>
    </div>
</div>

<style>
    .kv-row {
        display: grid;
        grid-template-columns: 0.8fr 1fr 1fr 60px;
        gap: 0;
        border-bottom: 0.5px solid var(--border);
        transition: background 0.1s ease;
    }

    .kv-row:last-child {
        border-bottom: none;
    }

    .kv-row:hover {
        background: var(--hover);
    }

    .col-key,
    .col-initial,
    .col-value {
        display: flex;
        align-items: center;
        padding: 0;
        border-right: 0.5px solid var(--border);
    }

    .kv-input {
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        border: none;
        font-size: 13px;
        color: var(--text-primary);
        box-shadow: none;
        transition: background 0.1s ease;
    }

    .kv-input:focus {
        outline: none;
        background: var(--bg-darker);
    }

    .kv-input::placeholder {
        color: var(--text-secondary);
        opacity: 0.5;
    }

    .col-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
    }

    .btn-reset,
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
        box-shadow: none;
    }

    .kv-row:hover .btn-reset,
    .kv-row:hover .btn-remove {
        opacity: 0.6;
    }

    .btn-reset:hover {
        opacity: 1 !important;
        color: var(--orange);
        background: color-mix(in srgb, var(--orange) 15%, transparent);
    }

    .btn-remove:hover {
        opacity: 1 !important;
        color: var(--red);
        background: var(--red-hover);
    }
</style>

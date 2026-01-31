<script lang="ts">
    import type { EnvVariable } from "$lib/types/http";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import PlusIcon from "$lib/ui/icons/PlusIcon.svelte";
    import CloseIcon from "$lib/ui/icons/CloseIcon.svelte";
    import ResetIcon from "$lib/ui/icons/ResetIcon.svelte";

    const env = $derived(environmentStore.selected);

    function addRow() {
        if (!env) return;
        const newVar: EnvVariable = { key: "", value: "" };
        environmentStore.updateLocal(env.id, undefined, [
            ...env.variables,
            newVar,
        ]);
    }

    function updateKey(index: number, key: string) {
        if (!env) return;
        const updated = [...env.variables];
        const variable = updated[index];
        // Set initial_value when key is first set
        if (!variable.initial_value && variable.value) {
            updated[index] = {
                ...variable,
                key,
                initial_value: variable.value,
            };
        } else {
            updated[index] = { ...variable, key };
        }
        environmentStore.updateLocal(env.id, undefined, updated);
    }

    function updateValue(index: number, value: string) {
        if (!env) return;
        const updated = [...env.variables];
        const variable = updated[index];
        // Set initial_value on first value input if not already set
        if (!variable.initial_value && value && variable.key) {
            updated[index] = { ...variable, value, initial_value: value };
        } else {
            updated[index] = { ...variable, value };
        }
        environmentStore.updateLocal(env.id, undefined, updated);
    }

    function updateInitialValue(index: number, initial_value: string) {
        if (!env) return;
        const updated = [...env.variables];
        updated[index] = {
            ...updated[index],
            initial_value: initial_value || undefined,
        };
        environmentStore.updateLocal(env.id, undefined, updated);
    }

    function resetToInitial(index: number) {
        if (!env) return;
        const updated = [...env.variables];
        const variable = updated[index];
        if (variable.initial_value) {
            updated[index] = { ...variable, value: variable.initial_value };
            environmentStore.updateLocal(env.id, undefined, updated);
        }
    }

    function removeRow(index: number) {
        if (!env) return;
        const updated = env.variables.filter((_, i) => i !== index);
        environmentStore.updateLocal(env.id, undefined, updated);
    }

    function hasChanged(variable: EnvVariable): boolean {
        return (
            !!variable.initial_value &&
            variable.value !== variable.initial_value
        );
    }
</script>

{#if env}
    <section class="environment-editor">
        <header class="editor-header">
            <h2>{env.name}</h2>
            <span class="var-count">{env.variables.length} variables</span>
        </header>

        <div class="editor-content">
            <div class="kv-editor">
                <div class="kv-table">
                    <div class="kv-header">
                        <div class="col-key">VARIABLE</div>
                        <div class="col-initial">INITIAL VALUE</div>
                        <div class="col-value">CURRENT VALUE</div>
                        <div class="col-actions"></div>
                    </div>

                    {#each env.variables as variable, i}
                        <div
                            class="kv-row"
                            class:changed={hasChanged(variable)}
                        >
                            <div class="col-key">
                                <input
                                    type="text"
                                    class="kv-input"
                                    placeholder="Variable name"
                                    value={variable.key}
                                    oninput={(e) =>
                                        updateKey(i, e.currentTarget.value)}
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
                                    oninput={(e) =>
                                        updateInitialValue(
                                            i,
                                            e.currentTarget.value,
                                        )}
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
                                    oninput={(e) =>
                                        updateValue(i, e.currentTarget.value)}
                                    autocomplete="off"
                                    autocorrect="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                />
                            </div>
                            <div class="col-actions">
                                {#if hasChanged(variable)}
                                    <button
                                        type="button"
                                        class="btn-reset"
                                        onclick={() => resetToInitial(i)}
                                        aria-label="Reset to initial value"
                                        title="Reset to initial value"
                                    >
                                        <ResetIcon size={14} />
                                    </button>
                                {/if}
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
                    <span
                        >Add {env.variables.length === 0
                            ? "Variable"
                            : "Row"}</span
                    >
                </button>
            </div>
        </div>
    </section>
{/if}

<style>
    .environment-editor {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg);
        min-height: 0;
        overflow: hidden;
    }

    .editor-header {
        height: 50px;
        padding: 12px 20px;
        border-bottom: 0.5px solid var(--border);
        display: flex;
        align-items: baseline;
        gap: 12px;
    }

    .editor-header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .var-count {
        font-size: 12px;
        color: var(--text-secondary);
    }

    .editor-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        min-height: 0;
    }

    .kv-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 14px;
    }

    .kv-table {
        border: 0.5px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
        background: var(--bg);
    }

    .kv-header {
        display: grid;
        grid-template-columns: 0.8fr 1fr 1fr 60px;
        gap: 0;
        padding: 8px 0;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        background: var(--bg);
        border-bottom: 0.5px solid var(--border);
    }

    .kv-header div {
        border: none !important;
        padding-left: 12px;
    }

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
        border-color: var(--action);
        color: var(--action);
    }
</style>

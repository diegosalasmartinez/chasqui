<script lang="ts">
    import type { EnvVariable } from "$lib/types/http";
    import { environmentStore } from "$lib/stores/environment.svelte";
    import EnvVariableRow from "./EnvVariableRow.svelte";
    import PlusIcon from "$lib/ui/icons/PlusIcon.svelte";

    const env = $derived(environmentStore.selected);

    function updateVariables(updated: EnvVariable[]) {
        if (!env) return;

        environmentStore.updateLocal(env.id, undefined, updated);
    }

    function addRow() {
        if (!env) return;

        updateVariables([...env.variables, { key: "", value: "" }]);
    }

    function updateKey(index: number, key: string) {
        if (!env) return;

        const updated = [...env.variables];
        const v = updated[index];
        updated[index] =
            !v.initial_value && v.value
                ? { ...v, key, initial_value: v.value }
                : { ...v, key };
        updateVariables(updated);
    }

    function updateValue(index: number, value: string) {
        if (!env) return;

        const updated = [...env.variables];
        const v = updated[index];
        updated[index] =
            !v.initial_value && value && v.key
                ? { ...v, value, initial_value: value }
                : { ...v, value };
        updateVariables(updated);
    }

    function updateInitialValue(index: number, initial_value: string) {
        if (!env) return;

        const updated = [...env.variables];
        updated[index] = {
            ...updated[index],
            initial_value: initial_value || undefined,
        };
        updateVariables(updated);
    }

    function resetToInitial(index: number) {
        if (!env) return;

        const updated = [...env.variables];
        const v = updated[index];
        if (v.initial_value) {
            updated[index] = { ...v, value: v.initial_value };
            updateVariables(updated);
        }
    }

    function removeRow(index: number) {
        if (!env) return;

        updateVariables(env.variables.filter((_, i) => i !== index));
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
                        <EnvVariableRow
                            {variable}
                            onUpdateKey={(key) => updateKey(i, key)}
                            onUpdateValue={(value) => updateValue(i, value)}
                            onUpdateInitialValue={(val) =>
                                updateInitialValue(i, val)}
                            onReset={() => resetToInitial(i)}
                            onRemove={() => removeRow(i)}
                        />
                    {/each}
                </div>

                <button type="button" class="btn-add" onclick={addRow}>
                    <PlusIcon size={16} />
                    <span>
                        Add {env.variables.length === 0 ? "Variable" : "Row"}
                    </span>
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
        background: var(--bg-darker);
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
        background: var(--surface);
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
        background: var(--surface);
        border-bottom: 0.5px solid var(--border);
    }

    .kv-header div {
        border: none !important;
        padding-left: 12px;
    }

    .btn-add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 0;
        background: var(--surface);
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

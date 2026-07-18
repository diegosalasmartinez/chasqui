<script lang="ts">
    interface Column {
        key: string;
        label: string;
    }

    interface Props {
        columns: Column[];
        rows: Record<string, unknown>[];
        emptyMessage?: string;
    }

    let { columns, rows, emptyMessage = "No data" }: Props = $props();
</script>

{#if rows.length > 0}
    <div class="data-table">
        <div class="table-header" style:grid-template-columns="repeat({columns.length}, 1fr)">
            {#each columns as col}
                <span>{col.label}</span>
            {/each}
        </div>
        {#each rows as row}
            <div class="table-row" style:grid-template-columns="repeat({columns.length}, 1fr)">
                {#each columns as col, i}
                    <span class={i === 0 ? "cell-key" : "cell-value"}>{row[col.key] ?? ""}</span>
                {/each}
            </div>
        {/each}
    </div>
{:else}
    <p class="empty">{emptyMessage}</p>
{/if}

<style>
    .data-table {
        border: 0.5px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
    }

    .table-header {
        display: grid;
        padding: 8px 12px;
        background: var(--bg-darker);
        border-bottom: 0.5px solid var(--border);
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
    }

    .table-row {
        display: grid;
        padding: 8px 12px;
        border-bottom: 0.5px solid var(--border);
        font-size: 13px;
    }

    .table-row:last-child {
        border-bottom: none;
    }

    .cell-key {
        color: var(--text-secondary);
    }

    .cell-value {
        color: var(--text-primary);
        word-break: break-all;
    }

    .empty {
        color: var(--text-secondary);
        font-size: 13px;
        margin: 0;
    }
</style>

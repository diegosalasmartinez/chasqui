<script lang="ts">
    import type { Response } from "$lib/types/http";
    import { apiStore } from "$lib/stores/api.svelte";
    import { fmtMs, fmtBytes } from "$lib/utils/common";

    interface Props {
        response?: Response;
    }

    let { response: propResponse }: Props = $props();

    const statusTint = (code?: number) => {
        if (typeof code !== "number") return "neutral";
        if (code >= 200 && code < 300) return "ok";
        if (code >= 300 && code < 400) return "info";
        if (code >= 400 && code < 500) return "warn";
        return "err";
    };

    let response = $derived(propResponse ?? apiStore.currentResponse);
</script>

{#if response}
    <div class="stats">
        <span class="badge {statusTint(response.status)}">
            {response.status}
        </span>
        <span class="dot">•</span>
        <span class="pill">
            {fmtMs(response.duration_ms)}
        </span>
        <span class="dot">•</span>
        <span class="pill">
            {fmtBytes(response.size_bytes)}
        </span>
    </div>
{/if}

<style>
    .stats {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .dot {
        color: var(--text-tertiary);
        font-size: 10px;
    }

    .badge {
        font-size: 12px;
        font-weight: 500;
        margin-right: 6px;
    }

    .badge.ok {
        color: var(--success);
    }

    .badge.info {
        color: var(--info);
    }

    .badge.warn {
        color: var(--warning);
    }

    .badge.err {
        color: var(--error);
    }

    .pill {
        color: var(--text-primary);
        font-size: 12px;
        padding: 4px 6px;
    }
</style>

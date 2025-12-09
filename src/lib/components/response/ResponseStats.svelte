<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import { fmtMs, fmtBytes } from "$lib/utils/common";

    const statusTint = (code?: number) => {
        if (typeof code !== "number") return "neutral";
        if (code >= 200 && code < 300) return "ok";
        if (code >= 300 && code < 400) return "info";
        if (code >= 400 && code < 500) return "warn";
        return "err";
    };

    let response = $derived(apiStore.currentResponse);
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
        color: #94a3b8;
        font-size: 10px;
    }

    .badge {
        font-size: 12px;
        font-weight: 500;
        margin-right: 6px;
    }

    .badge.ok {
        color: #6bdd9a;
    }

    .badge.info {
        color: #eff6ff;
    }

    .badge.warn {
        color: #fff7ed;
    }

    .badge.err {
        color: #fef2f2;
    }

    .pill {
        color: var(--text-primary);
        font-size: 12px;
        padding: 4px 6px;
    }
</style>

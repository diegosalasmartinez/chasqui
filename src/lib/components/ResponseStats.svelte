<script lang="ts">
    import { response } from "$lib/stores/request";
    import { fmtMs, fmtBytes } from "$lib/utils/common";

    const statusTint = (code?: number) => {
        if (typeof code !== "number") return "neutral";
        if (code >= 200 && code < 300) return "ok";
        if (code >= 300 && code < 400) return "info";
        if (code >= 400 && code < 500) return "warn";
        return "err";
    };
</script>

{#if $response}
    <div class="stats">
        <span class="badge {statusTint($response.status)}">
            Status: {$response.status}
        </span>
        <span class="dot">•</span>
        <span class="pill">
            {fmtMs($response.duration_ms)}
        </span>
        <span class="dot">•</span>
        <span class="pill">
            {fmtBytes($response.size_bytes)}
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
        padding: 2px 12px;
        border-radius: 10px;
        margin-right: 6px;
        border: 1px solid red;
        background: #f8fafc;
    }

    .badge.ok {
        background: #6bdd9a;
        border-color: #43a86f;
        color: #10301e;
    }
    .badge.info {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1e3a8a;
    }
    .badge.warn {
        background: #fff7ed;
        border-color: #fed7aa;
        color: #7c2d12;
    }
    .badge.err {
        background: #fef2f2;
        border-color: #fecaca;
        color: #7f1d1d;
    }

    .pill {
        font-size: 12px;
        padding: 4px 6px;
    }
</style>

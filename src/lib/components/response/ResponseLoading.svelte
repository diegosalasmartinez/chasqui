<section class="loading" aria-busy="true" aria-label="Loading">
    <div class="spinner"></div>
    <span class="text">Loading…</span>
</section>

<style>
    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: var(--text-primary);
        font-weight: 400;
        border-top: 0.5px solid var(--border);
        border-right: 0.5px solid var(--border);
        border-bottom: 0.5px solid var(--border);
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--text-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .text {
        font-size: 14px;
        opacity: 0.8;
    }
</style>

<script lang="ts">
    import { toastStore, type Toast } from "$lib/stores/toast.svelte";

    const typeClass: Record<Toast["type"], string> = {
        success: "toast--success",
        error: "toast--error",
        info: "toast--info",
        warning: "toast--warning",
    };
</script>

<div class="toast-container">
    {#each toastStore.toasts as toast (toast.id)}
        <div class={`toast ${typeClass[toast.type]}`}>
            <div class="toast__content">
                <span class="toast__message">{toast.message}</span>
            </div>

            <button
                class="toast__close"
                type="button"
                on:click={() => toastStore.dismiss(toast.id)}
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        right: 1.5rem;
        bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 9999;
        pointer-events: none;
    }

    .toast {
        pointer-events: auto;
        min-width: 260px;
        max-width: 360px;
        padding: 0.75rem 0.9rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
        background: #1f2933;
        color: #f9fafb;
        font-size: 0.9rem;
        animation: toast-in 0.18s ease-out;
    }

    .toast__content {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1;
    }

    .toast__message {
        line-height: 1.3;
    }

    .toast__close {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        opacity: 0.7;
        padding: 0.1rem;
        transition:
            opacity 0.15s ease,
            transform 0.1s ease;
    }

    .toast__close:hover {
        opacity: 1;
        transform: scale(1.06);
    }

    .toast--success {
        border-left: 4px solid var(--success);
    }

    .toast--error {
        border-left: 4px solid var(--error);
    }

    .toast--info {
        border-left: 4px solid var(--info);
    }

    .toast--warning {
        border-left: 4px solid var(--warning);
    }

    @keyframes toast-in {
        from {
            opacity: 0;
            transform: translateY(10px) translateX(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0) translateX(0);
        }
    }
</style>

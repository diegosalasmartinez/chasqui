<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        open: boolean;
        title: string;
        onClose: () => void;
        children: Snippet;
    };

    let { open, title, onClose, children }: Props = $props();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            onClose();
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events (Escape already closes the modal via svelte:window) -->
    <div class="modal-backdrop" onclick={handleBackdropClick}>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header class="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button class="close-btn" onclick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </header>
            <div class="modal-content">
                {@render children()}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal {
        background: var(--bg-darker);
        border: 1px solid var(--border);
        border-radius: 12px;
        min-width: 500px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.15s ease-out;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: none;
    }

    .close-btn:hover {
        background: var(--hover);
        color: var(--text-primary);
    }

    .modal-content {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }
</style>

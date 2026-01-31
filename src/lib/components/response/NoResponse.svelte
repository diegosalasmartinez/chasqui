<script lang="ts">
    import SendIcon from "$lib/ui/icons/SendIcon.svelte";
</script>

<section class="no-response">
    <div class="content">
        <div class="icon-wrapper">
            <SendIcon size={32} />
        </div>
        <h2>Ready to send</h2>
        <p>Hit the send button to make your first request</p>

        <div class="shortcuts">
            <div class="shortcut">
                <kbd>Cmd</kbd>
                <span>+</span>
                <kbd>Enter</kbd>
                <span class="shortcut-label">Send request</span>
            </div>
        </div>
    </div>
</section>

<style>
    .no-response {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 40px;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        max-width: 280px;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: var(--surface);
        color: var(--text-secondary);
        margin-bottom: 8px;
    }

    h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    }

    p {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        text-align: center;
        line-height: 1.5;
    }

    .shortcuts {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 20px;
        padding-top: 20px;
        width: 100%;
    }

    .shortcut {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-secondary);
    }

    kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 22px;
        padding: 0 6px;
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 4px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 500;
        color: var(--text-secondary);
    }

    .shortcut-label {
        margin-left: 8px;
        color: var(--text-secondary);
    }
</style>

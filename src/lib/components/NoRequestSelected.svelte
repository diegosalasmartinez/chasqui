<script lang="ts">
    import AddIcon from "$lib/ui/icons/AddIcon.svelte";
    import ShortcutList from "$lib/ui/ShortcutList.svelte";

    const shortcuts = [
        { keys: ["Mod", "N"], label: "New request" },
        { keys: ["Mod", "F"], label: "Search" },
        { keys: ["Mod", "1–3"], label: "Switch sidebar view" },
    ];
</script>

<section class="no-request">
    <div class="content">
        <div class="icon-wrapper">
            <AddIcon size={32} />
        </div>
        <h2>No request selected</h2>
        <p>Select a request from the sidebar or create a new one</p>

        <div class="shortcuts-wrapper">
            <ShortcutList {shortcuts} />
        </div>
    </div>
</section>

<style>
    .no-request {
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

    .shortcuts-wrapper {
        margin-top: 20px;
        padding-top: 20px;
        width: 100%;
    }
</style>

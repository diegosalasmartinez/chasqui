<script lang="ts">
    import ThemeToggler from "$lib/components/ThemeToggler.svelte";
    // TODO: update logo
</script>

<aside id="sidebar">
    <div class="logo">c</div>
    <ThemeToggler />
</aside>

<style>
    #sidebar {
        min-height: max-content;
        width: 100%;
        height: 100%;
        padding: 10px 20px;
        background: var(--bg-darker);
        border: 0.5px solid var(--border);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .logo {
        padding: 0;
        margin: 0;
        font-size: 28px;
        font-weight: 500;
        color: var(--text-primary);
        height: 40px;
    }
</style>

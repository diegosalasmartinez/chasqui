<script lang="ts">
    import { requestStore } from "$lib/stores/request.svelte";
    import ThemeToggler from "$lib/components/ThemeToggler.svelte";
    import SavedApis from "$lib/components/SavedApis.svelte";
</script>

<aside id="sidebar">
    <section class="title">
        <h1>Chasqui</h1>
        <ThemeToggler />
    </section>

    <section class="new-actions">
        <button
            id="new-request"
            onclick={() => requestStore.selectNewRequest()}
        >
            New Request
        </button>
        <button id="new-dropdown">+</button>
    </section>

    <SavedApis />
</aside>

<style>
    #sidebar {
        width: 100%;
        min-height: max-content;
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0px;
        margin-bottom: 20px;
        color: var(--text-primary);
    }

    .title h1 {
        padding: 0;
        margin: 0;
        font-size: 32px;
    }

    .new-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    #new-request {
        flex: 1;
        background: var(--blue);
    }
</style>

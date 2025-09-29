<script lang="ts">
    export let onClick: () => void;
    export let isActive: boolean;
    export let text: string;
</script>

<button
    role="tab"
    class="tab {isActive ? 'active' : ''}"
    aria-selected={isActive}
    tabindex={isActive ? 0 : -1}
    on:click={() => onClick()}
>
    {text}
</button>

<style>
    .tab {
        background: transparent;
        box-shadow: none;
        border: 0;
        border-radius: 0;
        padding: 8px 12px;
        font-size: 13px;
        color: var(--fg);
        cursor: pointer;
    }

    .tab:hover {
        color: var(--fg-hover);
    }

    .tab.active {
        border-bottom: 1px solid var(--fg-hover);
    }
</style>

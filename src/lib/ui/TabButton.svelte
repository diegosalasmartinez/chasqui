<script lang="ts">
    export let onClick: () => void;
    export let isActive: boolean;
    export let text: string;
</script>

<button
    type="button"
    role="tab"
    class="tab {isActive ? 'active' : ''}"
    aria-selected={isActive}
    tabindex={isActive ? 0 : -1}
    onclick={() => onClick()}
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
        color: var(--text-primary);
        cursor: pointer;
    }

    .tab:hover {
        /*color: var(--text-primary-hover);*/
        color: var(--blue);
    }

    .tab.active {
        /*border-bottom: 1px solid var(--text-primary-hover);*/
        border-bottom: 1px solid var(--blue);
    }
</style>

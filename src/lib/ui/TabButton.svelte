<script lang="ts">
    export let onClick: () => void;
    export let isActive: boolean;
    export let text: string;
    export let hasContent: boolean = false;
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
    {#if hasContent}
        <span class="content-indicator"></span>
    {/if}
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
        position: relative;
    }

    .tab:hover {
        color: var(--action);
    }

    .tab.active {
        border-bottom: 1px solid var(--action);
    }

    .content-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--action);
    }
</style>

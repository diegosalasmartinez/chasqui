<script lang="ts">
    import DotsIcon from "$lib/ui/icons/DotsIcon.svelte";
    import type { MenuItem } from "$lib/types/menu";
    import { clickOutside } from "$lib/utils/common";

    interface Props {
        items: MenuItem[];
        triggerClass?: string;
    }

    let { items, triggerClass = "" }: Props = $props();

    let open = $state(false);

    function toggleMenu(event: MouseEvent) {
        event.stopPropagation();
        open = !open;
    }

    function closeMenu() {
        open = false;
    }

    function handleItemClick(item: MenuItem, event: MouseEvent) {
        event.stopPropagation();
        item.onClick();
        closeMenu();
    }
</script>

<div class="menu-container" use:clickOutside={closeMenu}>
    <button
        type="button"
        class="menu-trigger ghost {triggerClass}"
        class:open
        onclick={toggleMenu}
        aria-label="More options"
        aria-expanded={open}
    >
        <DotsIcon />
    </button>

    {#if open}
        <ul class="context-menu" role="menu">
            {#each items as item}
                <li role="menuitem">
                    <button
                        type="button"
                        class="menu-item ghost"
                        class:danger={item.danger}
                        onclick={(e) => handleItemClick(item, e)}
                    >
                        {#if item.icon}
                            {@html item.icon}
                        {/if}
                        <span>{item.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .menu-container {
        position: relative;
        display: inline-flex;
    }

    .menu-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 0;
        opacity: 0.6;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.15s ease;
    }

    .menu-trigger:hover,
    .menu-trigger.open {
        opacity: 1;
    }

    .context-menu {
        position: absolute;
        right: 0;
        top: calc(100% - 5px);
        z-index: 50;
        list-style: none;
        padding: 4px;
        background: var(--surface);
        border: 0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        min-width: 160px;
        animation: slideDown 0.15s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.1s ease;
        font-size: 14px;
    }

    .menu-item:hover {
        background: var(--hover);
    }

    .menu-item.danger {
        color: var(--red);
    }

    .menu-item.danger:hover {
        background: var(--red-hover);
    }

    .menu-item :global(svg) {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .menu-item span {
        flex: 1;
        text-align: left;
    }
</style>

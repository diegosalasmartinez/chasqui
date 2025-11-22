<script lang="ts">
    import { clickOutside } from "$lib/utils/common";
    import { COLORS, METHODS } from "$lib/constants/http.constants";
    import { apiStore } from "$lib/stores/api.svelte";
    import type { HttpMethod } from "$lib/types/http";

    let open = $state(false);
    let highlighted = $state(0);

    const method = $derived(apiStore.api?.request.method);

    $effect(() => {
        highlighted = Math.max(0, METHODS.indexOf(method as HttpMethod));
    });

    function toggleOpen() {
        open = !open;
    }

    function closeMenu() {
        open = false;
    }

    function choose(m: HttpMethod) {
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                method: m,
            },
        }));
        closeMenu();
    }
</script>

<div
    role="button"
    tabindex="-1"
    class="select"
    use:clickOutside={() => closeMenu()}
>
    <button
        type="button"
        class="method-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onclick={toggleOpen}
        style:color={method ? COLORS[method] : COLORS.GET}
    >
        <span class="method-text">{method}</span>
        <svg class="chevron" class:open viewBox="0 0 20 20" aria-hidden="true">
            <path
                d="M5.5 7.5l4.5 4.5 4.5-4.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    </button>

    {#if open}
        <ul class="list" role="listbox" tabindex="-1">
            {#each METHODS as m, i}
                <li role="option" aria-selected={method === m}>
                    <button
                        type="button"
                        class="item ghost"
                        class:active={i === highlighted}
                        onmouseenter={() => (highlighted = i)}
                        onclick={() => choose(m as HttpMethod)}
                        style:--method-color={COLORS[m]}
                    >
                        <span
                            class="method-badge"
                            style:background-color={COLORS[m]}
                        >
                            {m}
                        </span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .select {
        position: relative;
        display: inline-block;
    }

    .method-selector {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
        min-width: 110px;
        border-radius: 0;
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
        transition: all 0.15s ease;
    }

    .method-text {
        letter-spacing: 0.025em;
    }

    .chevron {
        width: 1rem;
        height: 1rem;
        transition: transform 0.2s ease;
    }

    .chevron.open {
        transform: rotate(180deg);
    }

    .list {
        position: absolute;
        z-index: 50;
        margin-top: 4px;
        list-style: none;
        padding: 0.25rem;
        background: var(--surface);
        border-radius: 0.5rem;
        min-width: 110px;
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

    .item {
        display: flex;
        width: 100%;
        align-items: center;
        padding: 0.25rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 0.375rem;
        transition: background 0.1s ease;
    }

    .item:hover,
    .item.active {
        background: var(--surface-hover);
    }

    .method-badge {
        flex: 1;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: 600;
        font-size: 0.8125rem;
        color: white;
        text-align: center;
        letter-spacing: 0.025em;
    }
</style>

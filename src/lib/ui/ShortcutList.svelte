<script lang="ts">
    type Shortcut = { keys: string[]; label: string };
    type Props = { shortcuts: Shortcut[] };

    let { shortcuts }: Props = $props();

    const isMac = navigator.platform.toUpperCase().includes("MAC");

    // "Mod" renders as the platform's primary modifier
    const resolveKey = (key: string) => (key === "Mod" ? (isMac ? "Cmd" : "Ctrl") : key);
</script>

<div class="shortcuts">
    {#each shortcuts as shortcut}
        <div class="keys">
            {#each shortcut.keys as key, i}
                {#if i > 0}<span class="plus">+</span>{/if}
                <kbd>{resolveKey(key)}</kbd>
            {/each}
        </div>
        <span class="label">{shortcut.label}</span>
    {/each}
</div>

<style>
    .shortcuts {
        display: grid;
        grid-template-columns: auto auto;
        gap: 8px 14px;
        justify-content: center;
        align-items: center;
    }

    .keys {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
    }

    .plus {
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

    .label {
        font-size: 12px;
        color: var(--text-secondary);
        text-align: left;
    }
</style>

<script lang="ts">
    import { environmentStore } from "$lib/stores/environment.svelte";

    interface Props {
        value: string;
        placeholder?: string;
        class?: string;
        disabled?: boolean;
        oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    }

    let {
        value,
        placeholder = "",
        class: className = "",
        disabled = false,
        oninput
    }: Props = $props();

    let inputRef: HTMLInputElement | null = $state(null);
    let showAutocomplete = $state(false);
    let autocompleteIndex = $state(0);
    let autocompletePrefix = $state("");
    let autocompleteStartIndex = $state(0);
    let cursorPosition = $state(0);
    let dropdownPosition = $state({ top: 0, left: 0, width: 0 });

    const variables = $derived(environmentStore.variablesMap);
    const variableNames = $derived(Array.from(variables.keys()));

    function updateDropdownPosition() {
        if (!inputRef) return;
        const rect = inputRef.getBoundingClientRect();
        dropdownPosition = {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    }

    const filteredVars = $derived.by(() => {
        if (!showAutocomplete) return [];
        const prefix = autocompletePrefix.toLowerCase();
        if (prefix === "") return variableNames;
        return variableNames.filter(v => v.toLowerCase().startsWith(prefix));
    });

    function checkAutocomplete(text: string, pos: number) {
        const beforeCursor = text.slice(0, pos);
        const match = beforeCursor.match(/\{\{(\w*)$/);
        if (match && variableNames.length > 0) {
            autocompletePrefix = match[1];
            autocompleteStartIndex = match.index!;
            showAutocomplete = true;
            updateDropdownPosition();
        } else {
            showAutocomplete = false;
        }
    }

    function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
        const pos = e.currentTarget.selectionStart || 0;
        cursorPosition = pos;
        checkAutocomplete(e.currentTarget.value, pos);
        autocompleteIndex = 0;
        oninput?.(e);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!showAutocomplete || filteredVars.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            autocompleteIndex = (autocompleteIndex + 1) % filteredVars.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            autocompleteIndex = (autocompleteIndex - 1 + filteredVars.length) % filteredVars.length;
        } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insertVariable(filteredVars[autocompleteIndex]);
        } else if (e.key === "Escape") {
            showAutocomplete = false;
        }
    }

    function insertVariable(varName: string) {
        if (!inputRef) return;

        const before = value.slice(0, autocompleteStartIndex);
        const after = value.slice(cursorPosition);
        const newValue = `${before}{{${varName}}}${after}`;

        inputRef.value = newValue;
        const event = new Event("input", { bubbles: true }) as Event & { currentTarget: HTMLInputElement };
        Object.defineProperty(event, "currentTarget", { value: inputRef });
        oninput?.(event);

        showAutocomplete = false;

        const newPos = before.length + varName.length + 4;
        setTimeout(() => {
            inputRef?.setSelectionRange(newPos, newPos);
            inputRef?.focus();
        }, 0);
    }

    function handleBlur() {
        setTimeout(() => {
            showAutocomplete = false;
        }, 150);
    }

    function handleClick() {
        const pos = inputRef?.selectionStart || 0;
        cursorPosition = pos;
        checkAutocomplete(value, pos);
    }
</script>

<input
    bind:this={inputRef}
    type="text"
    class={className}
    {placeholder}
    {value}
    {disabled}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onblur={handleBlur}
    onclick={handleClick}
/>

{#if showAutocomplete && filteredVars.length > 0}
    <ul class="autocomplete-list" style="top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; width: {dropdownPosition.width}px;">
        {#each filteredVars as varName, i}
            <li>
                <button
                    type="button"
                    class="autocomplete-item"
                    class:active={i === autocompleteIndex}
                    onmousedown={() => insertVariable(varName)}
                >
                    <span class="var-name">{varName}</span>
                    <span class="var-value">{variables.get(varName)}</span>
                </button>
            </li>
        {/each}
    </ul>
{/if}

<style>
    .autocomplete-list {
        position: fixed;
        z-index: 1000;
        list-style: none;
        padding: 4px;
        margin-top: 2px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-height: 200px;
        overflow-y: auto;
    }

    .autocomplete-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 6px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-align: left;
        color: var(--text-primary);
    }

    .autocomplete-item:hover,
    .autocomplete-item.active {
        background: var(--hover);
    }

    .var-name {
        color: var(--orange);
        font-weight: 500;
    }

    .var-value {
        color: var(--text-secondary);
        font-size: 11px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

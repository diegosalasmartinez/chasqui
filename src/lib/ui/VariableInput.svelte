<script lang="ts">
    import { environmentStore } from "$lib/stores/environment.svelte";
    import { tick } from "svelte";

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

    let editorRef: HTMLDivElement | null = $state(null);
    let showAutocomplete = $state(false);
    let autocompleteIndex = $state(0);
    let autocompletePrefix = $state("");
    let autocompleteStartIndex = $state(0);
    let dropdownPosition = $state({ top: 0, left: 0, width: 0 });

    const variables = $derived(environmentStore.variablesMap);
    const variableNames = $derived(Array.from(variables.keys()));

    const filteredVars = $derived.by(() => {
        if (!showAutocomplete) return [];
        const prefix = autocompletePrefix.toLowerCase();
        if (prefix === "") return variableNames;
        return variableNames.filter(v => v.toLowerCase().startsWith(prefix));
    });

    function getTextContent(): string {
        if (!editorRef) return "";
        return editorRef.innerText || "";
    }

    function getCursorPosition(): number {
        const selection = window.getSelection();
        if (!selection || !editorRef || selection.rangeCount === 0) return 0;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    }

    function setCursorPosition(pos: number) {
        if (!editorRef) return;

        const selection = window.getSelection();
        if (!selection) return;

        let currentPos = 0;
        const walker = document.createTreeWalker(editorRef, NodeFilter.SHOW_TEXT, null);
        let node: Text | null;

        while ((node = walker.nextNode() as Text | null)) {
            const nodeLength = node.length;
            if (currentPos + nodeLength >= pos) {
                const range = document.createRange();
                range.setStart(node, pos - currentPos);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
            currentPos += nodeLength;
        }
    }

    function renderContent(text: string): string {
        if (!text) return "";
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const exists = variables.has(varName);
            const cls = exists ? "var-resolved" : "var-unresolved";
            return `<span class="${cls}">{{${varName}}}</span>`;
        });
    }

    function updateDropdownPosition() {
        if (!editorRef) return;
        const rect = editorRef.getBoundingClientRect();
        dropdownPosition = {
            top: rect.bottom,
            left: rect.left,
            width: rect.width
        };
    }

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

    function handleInput() {
        const text = getTextContent();
        const pos = getCursorPosition();

        // Re-render to fix any styling issues from contenteditable
        if (editorRef) {
            const rendered = renderContent(text);
            if (editorRef.innerHTML !== rendered) {
                editorRef.innerHTML = rendered;
                setCursorPosition(pos);
            }
        }

        // Emit event with fake input target
        if (oninput) {
            const event = new Event("input", { bubbles: true }) as Event & { currentTarget: HTMLInputElement };
            Object.defineProperty(event, "currentTarget", {
                value: { value: text },
                writable: false
            });
            oninput(event);
        }

        checkAutocomplete(text, pos);
        autocompleteIndex = 0;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (showAutocomplete && filteredVars.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                autocompleteIndex = (autocompleteIndex + 1) % filteredVars.length;
                return;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                autocompleteIndex = (autocompleteIndex - 1 + filteredVars.length) % filteredVars.length;
                return;
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertVariable(filteredVars[autocompleteIndex]);
                return;
            } else if (e.key === "Escape") {
                showAutocomplete = false;
                return;
            }
        }

        // Prevent Enter from creating new lines
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }

    async function insertVariable(varName: string) {
        if (!editorRef) return;

        const text = getTextContent();
        const pos = getCursorPosition();
        const before = text.slice(0, autocompleteStartIndex);
        const after = text.slice(pos);
        const newValue = `${before}{{${varName}}}${after}`;
        const newPos = before.length + varName.length + 4;

        // Update the content
        editorRef.innerHTML = renderContent(newValue);

        // Emit the change
        if (oninput) {
            const event = new Event("input", { bubbles: true }) as Event & { currentTarget: HTMLInputElement };
            Object.defineProperty(event, "currentTarget", {
                value: { value: newValue },
                writable: false
            });
            oninput(event);
        }

        showAutocomplete = false;

        await tick();
        setCursorPosition(newPos);
        editorRef?.focus();
    }

    function handleBlur() {
        setTimeout(() => {
            showAutocomplete = false;
        }, 150);
    }

    function handleClick() {
        const text = getTextContent();
        const pos = getCursorPosition();
        checkAutocomplete(text, pos);
    }

    function handlePaste(e: ClipboardEvent) {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
    }

    // Sync external value changes to editor
    $effect(() => {
        if (editorRef && value !== getTextContent()) {
            const pos = getCursorPosition();
            editorRef.innerHTML = renderContent(value);
            // Try to restore cursor position
            if (document.activeElement === editorRef) {
                setCursorPosition(Math.min(pos, value.length));
            }
        }
    });

    // Re-render when variables change (to update resolved/unresolved status)
    $effect(() => {
        // Access variables to create dependency
        const _ = variables.size;
        if (editorRef && value) {
            const pos = getCursorPosition();
            editorRef.innerHTML = renderContent(value);
            if (document.activeElement === editorRef) {
                setCursorPosition(Math.min(pos, value.length));
            }
        }
    });
</script>

<div
    bind:this={editorRef}
    class="{className} variable-input"
    class:disabled
    contenteditable={!disabled}
    role="textbox"
    aria-placeholder={placeholder}
    data-placeholder={placeholder}
    spellcheck="false"
    oninput={handleInput}
    onkeydown={handleKeydown}
    onblur={handleBlur}
    onclick={handleClick}
    onpaste={handlePaste}
></div>

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
    :global(.variable-input) {
        cursor: text;
        white-space: pre;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(.variable-input:empty::before) {
        content: attr(data-placeholder);
        color: var(--text-secondary);
        opacity: 0.5;
        pointer-events: none;
    }

    :global(.variable-input:focus) {
        outline: none;
    }

    :global(.variable-input.disabled) {
        cursor: not-allowed;
        opacity: 0.6;
    }

    :global(.variable-input .var-resolved) {
        color: var(--orange);
    }

    :global(.variable-input .var-unresolved) {
        color: var(--red);
    }

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
        align-items: center;
        gap: 12px;
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
        flex-shrink: 0;
    }

    .var-value {
        color: var(--text-secondary);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

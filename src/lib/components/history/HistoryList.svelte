<script lang="ts">
    import { COLORS } from "$lib/constants/http.constants";
    import { historyStore } from "$lib/stores/history.svelte";
    import type { HistoryEntry } from "$lib/types/http";
    import ChevronIcon from "$lib/ui/icons/ChevronIcon.svelte";

    type DayGroup = {
        label: string;
        key: string;
        entries: HistoryEntry[];
    };

    type Props = { searchQuery?: string };
    let { searchQuery = "" }: Props = $props();

    const query = $derived(searchQuery.toLowerCase().trim());

    let collapsedDays = $state<Set<string>>(new Set());

    function getDayKey(atMs: number): string {
        const date = new Date(atMs);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function getDayLabel(atMs: number): string {
        const date = new Date(atMs);
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const yesterday = new Date(today.getTime() - 86400000);
        const entryDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );

        if (entryDay.getTime() === today.getTime()) {
            return "Today";
        }
        if (entryDay.getTime() === yesterday.getTime()) {
            return "Yesterday";
        }

        return date.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
        });
    }

    function formatTime(atMs: number): string {
        const date = new Date(atMs);
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getStatusColor(status: number): string {
        if (status >= 200 && status < 300) return "var(--green)";
        if (status >= 300 && status < 400) return "var(--action)";
        if (status >= 400 && status < 500) return "var(--orange)";
        return "var(--red)";
    }

    function getUrlPath(url: string): string {
        try {
            const u = new URL(url);
            return u.pathname || "/";
        } catch {
            return url;
        }
    }

    function selectEntry(entry: HistoryEntry) {
        historyStore.select(entry.id);
    }

    function toggleDay(key: string) {
        const newSet = new Set(collapsedDays);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        collapsedDays = newSet;
    }

    function isExpanded(key: string): boolean {
        return !collapsedDays.has(key);
    }

    const groupedEntries = $derived.by(() => {
        const groups: DayGroup[] = [];
        const groupMap = new Map<string, DayGroup>();

        const entries = query
            ? historyStore.entries.filter(
                  (e) =>
                      e.request.url.toLowerCase().includes(query) ||
                      e.request.method.toLowerCase().includes(query),
              )
            : historyStore.entries;

        for (const entry of entries) {
            const key = getDayKey(entry.at_ms);
            let group = groupMap.get(key);
            if (!group) {
                group = {
                    label: getDayLabel(entry.at_ms),
                    key,
                    entries: [],
                };
                groupMap.set(key, group);
                groups.push(group);
            }
            group.entries.push(entry);
        }

        return groups;
    });
</script>

<section id="history-list">
    {#if historyStore.entries.length === 0}
        <div class="empty-state">No history yet</div>
    {:else if groupedEntries.length === 0}
        <div class="empty-state">No matches</div>
    {:else}
        {#each groupedEntries as group}
            <div class="day-group">
                <button class="day-header sidebar-item" onclick={() => toggleDay(group.key)}>
                    <span class="chevron" class:collapsed={!isExpanded(group.key)}>
                        <ChevronIcon size={12} />
                    </span>
                    <span class="day-label">{group.label}</span>
                </button>

                {#if isExpanded(group.key)}
                    <div class="day-entries">
                        {#each group.entries as entry}
                            <button
                                class="history-entry sidebar-item"
                                class:active={historyStore.selectedId === entry.id}
                                onclick={() => selectEntry(entry)}
                            >
                                <div class="entry-main">
                                    <span
                                        class="method"
                                        style:color={COLORS[entry.request.method] ||
                                            "var(--text-primary)"}
                                    >
                                        {entry.request.method}
                                    </span>
                                    <span class="url"
                                        >{getUrlPath(entry.request.url)}</span
                                    >
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    {/if}
</section>

<style>
    #history-list {
        font-size: 12.5px;
        padding: 5px;
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
    }

    .day-group {
        margin-bottom: 4px;
    }

    .day-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 8px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        box-shadow: none;
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .day-header:hover {
        background: var(--hover);
    }

    .chevron {
        display: flex;
        align-items: center;
        color: var(--text-tertiary);
        transition: transform 0.15s ease;
    }

    .chevron.collapsed {
        transform: rotate(-90deg);
    }

    .day-label {
        flex: 1;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--text-secondary);
    }

    .day-entries {
        margin-left: 16px;
        padding-left: 12px;
        border-left: 1px solid var(--border);
    }

    .history-entry {
        width: 100%;
        background: transparent;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s ease;
        position: relative;
    }

    .history-entry::before {
        content: "";
        position: absolute;
        left: -12px;
        top: 50%;
        width: 10px;
        height: 1px;
        background: var(--border);
    }

    .history-entry:hover,
    .history-entry.active {
        background: var(--hover);
    }

    .entry-main {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        height: 100%;
    }

    .method {
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .url {
        font-size: 12.5px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

</style>

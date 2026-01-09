import type { HistoryEntry, HistoryEntryRaw } from '$lib/types/http'
import { listHistoryBridge, clearHistoryBridge } from '$lib/infra/tauri'
import { toastStore } from '$lib/stores/toast.svelte'
import { bodyPrettify } from '$lib/utils/common'

const HISTORY_LIMIT = 50

function convertRawEntry(raw: HistoryEntryRaw): HistoryEntry {
    return {
        id: raw.id,
        at_ms: raw.at_ms,
        request: raw.request,
        response: {
            status: raw.response.status,
            headers: raw.response.headers,
            body: bodyPrettify(raw.response.body),
            at_ms: raw.response.at_ms,
            duration_ms: raw.response.duration_ms,
            size_bytes: raw.response.size_bytes
        }
    }
}

class HistoryStore {
    entries = $state<HistoryEntry[]>([])
    selectedId = $state<string | null>(null)
    loading = $state(false)

    get selected(): HistoryEntry | null {
        if (!this.selectedId) return null
        return this.entries.find(e => e.id === this.selectedId) ?? null
    }

    async load() {
        this.loading = true
        try {
            const rawEntries = await listHistoryBridge()
            this.entries = rawEntries.map(convertRawEntry)
        } catch (err) {
            toastStore.error('Failed to load history: ' + err)
        } finally {
            this.loading = false
        }
    }

    select(id: string | null) {
        this.selectedId = id
    }

    // Called by apiStore after a successful request
    addEntry(entry: HistoryEntry) {
        // Add to front
        this.entries = [entry, ...this.entries]

        // Enforce limit
        if (this.entries.length > HISTORY_LIMIT) {
            this.entries = this.entries.slice(0, HISTORY_LIMIT)
        }
    }

    async clear() {
        try {
            await clearHistoryBridge()
            this.entries = []
            this.selectedId = null
            toastStore.info('History cleared')
        } catch (err) {
            toastStore.error('Failed to clear history: ' + err)
        }
    }
}

export const historyStore = new HistoryStore()

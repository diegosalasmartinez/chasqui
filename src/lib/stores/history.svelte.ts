import type { HistoryEntry, HistoryEntryRaw } from '$lib/types/http'
import { listHistoryBridge, clearHistoryBridge } from '$lib/infra/tauri'
import { toastStore } from '$lib/stores/toast.svelte'
import { workspaceStore } from '$lib/stores/workspace.svelte'
import { bodyPrettify } from '$lib/utils/common'

const HISTORY_LIMIT = 50

function convertRawEntry(raw: HistoryEntryRaw): HistoryEntry {
    const contentType = raw.response.headers.find(h => h.key.toLowerCase() === 'content-type')?.value ?? ''
    return {
        id: raw.id,
        at_ms: raw.at_ms,
        workspace_id: raw.workspace_id,
        request: raw.request,
        response: {
            status: raw.response.status,
            headers: raw.response.headers,
            body: bodyPrettify(raw.response.body, contentType),
            at_ms: raw.response.at_ms,
            duration_ms: raw.response.duration_ms,
            size_bytes: raw.response.size_bytes
        }
    }
}

class HistoryStore {
    private allEntries = $state<HistoryEntry[]>([])
    selectedId = $state<string | null>(null)
    loading = $state(false)

    get entries(): HistoryEntry[] {
        const workspaceId = workspaceStore.currentWorkspaceId
        if (!workspaceId) return []
        return this.allEntries.filter(e => e.workspace_id === workspaceId)
    }

    get selected(): HistoryEntry | null {
        if (!this.selectedId) return null
        return this.entries.find(e => e.id === this.selectedId) ?? null
    }

    async load() {
        this.loading = true
        try {
            const rawEntries = await listHistoryBridge()
            this.allEntries = rawEntries.map(convertRawEntry)
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
        this.allEntries = [entry, ...this.allEntries]

        // Enforce limit (across all workspaces)
        if (this.allEntries.length > HISTORY_LIMIT) {
            this.allEntries = this.allEntries.slice(0, HISTORY_LIMIT)
        }
    }

    async clear() {
        try {
            await clearHistoryBridge()
            this.allEntries = []
            this.selectedId = null
            toastStore.info('History cleared')
        } catch (err) {
            toastStore.error('Failed to clear history: ' + err)
        }
    }

    clearSelection() {
        this.selectedId = null
    }
}

export const historyStore = new HistoryStore()

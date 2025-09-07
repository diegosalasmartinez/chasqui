import { writable } from 'svelte/store'
import type { HistoryItem } from '$lib/types/http'

export const history = writable<HistoryItem[]>([])

export function setHistory(items: HistoryItem[]) { history.set(items) }
export function pushHistory(item: HistoryItem) { history.update(h => [item, ...h]) }

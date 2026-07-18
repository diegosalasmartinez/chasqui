import { apiStore } from '$lib/stores/api.svelte'
import { sidebarStore } from '$lib/stores/sidebar.svelte'
import { exportModalStore } from '$lib/stores/exportModal.svelte'
import { importModalStore } from '$lib/stores/importModal.svelte'

// Registered by LeftPanel so Cmd+F can focus the sidebar search from anywhere
let searchInput: HTMLInputElement | null = null

export function registerSearchInput(el: HTMLInputElement | null) {
    searchInput = el
}

export function handleGlobalShortcut(e: KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return
    if (exportModalStore.open || importModalStore.open) return

    // Monaco binds Cmd+F (find) and Cmd+D (add selection) itself — don't
    // steal those while the editor has focus
    const inMonaco = e.target instanceof HTMLElement && e.target.closest('.monaco-editor') !== null

    switch (e.key.toLowerCase()) {
        case 'enter':
            e.preventDefault()
            apiStore.sendRequest()
            break
        case 's':
            e.preventDefault()
            apiStore.saveApi()
            break
        case 'n':
            e.preventDefault()
            apiStore.createApi()
            break
        case 'd':
            if (inMonaco || !apiStore.api) return
            e.preventDefault()
            apiStore.duplicateApi(apiStore.api)
            break
        case 'f':
            if (inMonaco) return
            e.preventDefault()
            searchInput?.focus()
            searchInput?.select()
            break
        case '1':
            e.preventDefault()
            sidebarStore.setView('collections')
            break
        case '2':
            e.preventDefault()
            sidebarStore.setView('environments')
            break
        case '3':
            e.preventDefault()
            sidebarStore.setView('history')
            break
    }
}

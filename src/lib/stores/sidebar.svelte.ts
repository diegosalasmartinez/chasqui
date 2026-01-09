type SidebarView = 'collections' | 'environments' | 'history'

class SidebarStore {
    view = $state<SidebarView>('collections')

    setView(view: SidebarView) {
        this.view = view
    }

    get isCollections() {
        return this.view === 'collections'
    }

    get isEnvironments() {
        return this.view === 'environments'
    }

    get isHistory() {
        return this.view === 'history'
    }
}

export const sidebarStore = new SidebarStore()

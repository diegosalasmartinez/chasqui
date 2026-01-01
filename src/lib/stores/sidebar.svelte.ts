type SidebarView = 'collections' | 'environments'

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
}

export const sidebarStore = new SidebarStore()

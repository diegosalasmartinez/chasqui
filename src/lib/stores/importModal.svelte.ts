function createImportModalStore() {
    let open = $state(false)

    return {
        get open() { return open },
        show() { open = true },
        close() { open = false },
    }
}

export const importModalStore = createImportModalStore()

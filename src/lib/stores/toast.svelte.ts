export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
    id: string
    message: string
    type: ToastType
    duration: number
}

const DEFAULT_DURATION = 4000

class ToastStore {
    toasts = $state<Toast[]>([])

    show(message: string, options?: { type?: ToastType; duration?: number }) {
        const id =
            (crypto?.randomUUID && crypto.randomUUID()) ||
            Math.random().toString(36).slice(2)

        const toast: Toast = {
            id,
            message,
            type: options?.type ?? 'info',
            duration: options?.duration ?? DEFAULT_DURATION
        }

        this.toasts = [...this.toasts, toast]

        // Auto-close
        setTimeout(() => {
            this.dismiss(id)
        }, toast.duration)
    }

    success(message: string, duration?: number) {
        this.show(message, { type: 'success', duration })
    }

    error(message: string, duration?: number) {
        this.show(message, { type: 'error', duration })
    }

    info(message: string, duration?: number) {
        this.show(message, { type: 'info', duration })
    }

    warning(message: string, duration?: number) {
        this.show(message, { type: 'warning', duration })
    }

    dismiss(id: string) {
        this.toasts = this.toasts.filter((t) => t.id !== id)
    }

    clear() {
        this.toasts = []
    }
}

export const toastStore = new ToastStore()

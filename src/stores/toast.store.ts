import { defineStore } from 'pinia'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: [],
  }),

  actions: {
    addToast(toast: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        duration: 5000,
        ...toast,
      }

      this.toasts.push(newToast)

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, newToast.duration)
      }

      return id
    },

    removeToast(id: string) {
      const index = this.toasts.findIndex((toast) => toast.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    clearAll() {
      this.toasts = []
    },

    success(message: string, title?: string, duration?: number) {
      return this.addToast({ type: 'success', message, title, duration })
    },

    error(message: string, title?: string, duration?: number) {
      return this.addToast({ type: 'error', message, title, duration })
    },

    warning(message: string, title?: string, duration?: number) {
      return this.addToast({ type: 'warning', message, title, duration })
    },

    info(message: string, title?: string, duration?: number) {
      return this.addToast({ type: 'info', message, title, duration })
    },
  },
})

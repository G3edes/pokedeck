import { create } from 'zustand'
import { generateId } from '@/lib/format'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = generateId()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4200)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'info' }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'warning' }),
}

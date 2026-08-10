import { createPortal } from 'react-dom'
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react'
import { useToastStore, type ToastVariant } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-leaf-200 bg-leaf-50 text-leaf-800 dark:border-leaf-500/30 dark:bg-leaf-500/10 dark:text-leaf-200',
  },
  error: {
    icon: XCircle,
    classes: 'border-ember-200 bg-ember-50 text-ember-800 dark:border-ember-500/30 dark:bg-ember-500/10 dark:text-ember-200',
  },
  info: {
    icon: Info,
    classes: 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
  },
  warning: {
    icon: TriangleAlert,
    classes: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant]
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            className={cn(
              'flex animate-toast-in items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm',
              config.classes,
            )}
            role="status"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}

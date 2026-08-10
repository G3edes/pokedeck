import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  max?: number
  tone?: 'brand' | 'ember' | 'leaf' | 'amber'
  className?: string
  showLabel?: boolean
}

const toneClasses = {
  brand: 'bg-brand-500',
  ember: 'bg-ember-500',
  leaf: 'bg-leaf-500',
  amber: 'bg-amber-500',
}

export function ProgressBar({ value, max = 100, tone = 'brand', className, showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn('h-full rounded-full transition-all duration-500', toneClasses[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}

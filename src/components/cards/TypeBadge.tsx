import { getEnergyTypeStyle } from '@/lib/energyTypes'
import { cn } from '@/lib/cn'

export function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const style = getEnergyTypeStyle(type)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wide',
        style.bg,
        style.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      {type}
    </span>
  )
}

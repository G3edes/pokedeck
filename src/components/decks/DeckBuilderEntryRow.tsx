import { Minus, Plus, X } from 'lucide-react'
import type { DeckCardEntry } from '@/types/deck'
import { TypeBadge } from '@/components/cards/TypeBadge'

interface DeckBuilderEntryRowProps {
  entry: DeckCardEntry
  maxCopies: number
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}

export function DeckBuilderEntryRow({ entry, maxCopies, onIncrement, onDecrement, onRemove }: DeckBuilderEntryRowProps) {
  const { card, quantity } = entry
  const atMax = quantity >= maxCopies

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
      <img src={card.images.small} alt={card.name} className="h-14 w-10 shrink-0 rounded-md object-contain" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{card.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {card.types?.slice(0, 2).map((t) => <TypeBadge key={t} type={t} />)}
          <span className="text-[11px] text-slate-400">#{card.number}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onDecrement}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-slate-800 dark:text-slate-100">{quantity}</span>
        <button
          onClick={onIncrement}
          disabled={atMax}
          title={atMax ? 'Limite de cópias atingido' : 'Adicionar cópia'}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-ember-50 hover:text-ember-500 dark:hover:bg-ember-500/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

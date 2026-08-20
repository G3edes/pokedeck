import { useMemo, useState } from 'react'
import { ListChecks, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/useWishlistStore'
import { Select, Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import type { WishlistPriority, WishlistStatus } from '@/types/collection'
import { formatCurrency, formatDate } from '@/lib/format'

const PRIORITY_TONE: Record<WishlistPriority, 'rose' | 'amber' | 'slate'> = {
  high: 'rose',
  medium: 'amber',
  low: 'slate',
}

const STATUS_LABEL: Record<WishlistStatus, string> = {
  wanted: 'Quero comprar',
  found: 'Encontrada',
  purchased: 'Comprada',
}

export function Wishlist() {
  const entriesMap = useWishlistStore((s) => s.entries)
  const entries = useMemo(() => Object.values(entriesMap), [entriesMap])
  const update = useWishlistStore((s) => s.update)
  const remove = useWishlistStore((s) => s.remove)
  const [statusTab, setStatusTab] = useState<'all' | WishlistStatus>('all')

  const filtered = useMemo(() => {
    return entries
      .filter((e) => statusTab === 'all' || e.status === statusTab)
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      })
  }, [entries, statusTab])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Lista de Desejos</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe as cartas que você quer adicionar à sua coleção.</p>
      </div>

      <div className="mb-6">
        <Tabs
          items={[
            { id: 'all', label: 'Todas', count: entries.length },
            { id: 'wanted', label: 'Quero comprar', count: entries.filter((e) => e.status === 'wanted').length },
            { id: 'found', label: 'Encontradas', count: entries.filter((e) => e.status === 'found').length },
            { id: 'purchased', label: 'Compradas', count: entries.filter((e) => e.status === 'purchased').length },
          ]}
          activeId={statusTab}
          onChange={(id) => setStatusTab(id as typeof statusTab)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="Sua lista de desejos está vazia" description="Adicione cartas que você deseja comprar futuramente." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <div key={entry.cardId} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
              <img src={entry.card.images.small} alt={entry.card.name} className="h-20 w-14 shrink-0 rounded-lg object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{entry.card.name}</p>
                  <Badge tone={PRIORITY_TONE[entry.priority]}>{entry.priority === 'high' ? 'Alta' : entry.priority === 'medium' ? 'Média' : 'Baixa'} prioridade</Badge>
                </div>
                <p className="text-xs text-slate-400">Adicionada em {formatDate(entry.addedAt)}</p>
                {entry.note && <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">"{entry.note}"</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                <Select value={entry.priority} onChange={(e) => update(entry.cardId, { priority: e.target.value as WishlistPriority })} className="!w-auto text-xs">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </Select>
                <Select value={entry.status} onChange={(e) => update(entry.cardId, { status: e.target.value as WishlistStatus })} className="!w-auto text-xs">
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  placeholder="Preço desejado"
                  defaultValue={entry.desiredPrice ?? ''}
                  onBlur={(e) => update(entry.cardId, { desiredPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="!w-28 text-xs"
                />
                <span className="text-xs text-slate-400">{formatCurrency(entry.desiredPrice)}</span>
                <button onClick={() => remove(entry.cardId)} className="text-slate-300 hover:text-ember-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Library, Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useCollectionStore } from '@/store/useCollectionStore'
import { Input, Select } from '@/components/ui/Input'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CARD_CONDITIONS, type CardCondition, type OwnershipStatus } from '@/types/collection'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'

const STATUS_LABEL: Record<OwnershipStatus, string> = {
  owned: 'Possuo',
  wanted: 'Quero comprar',
  duplicate: 'Repetida',
}

export function Collection() {
  const entriesMap = useCollectionStore((s) => s.entries)
  const entries = useMemo(() => Object.values(entriesMap), [entriesMap])
  const setStatus = useCollectionStore((s) => s.setStatus)
  const setQuantity = useCollectionStore((s) => s.setQuantity)
  const setCondition = useCollectionStore((s) => s.setCondition)
  const setNote = useCollectionStore((s) => s.setNote)
  const remove = useCollectionStore((s) => s.remove)

  const [statusTab, setStatusTab] = useState<'all' | OwnershipStatus>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return entries
      .filter((e) => statusTab === 'all' || e.status === statusTab)
      .filter((e) => e.card.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.card.name.localeCompare(b.card.name))
  }, [entries, statusTab, search])

  const stats = useMemo(() => {
    const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0)
    const uniqueCards = entries.length
    const duplicates = entries.reduce((sum, e) => sum + e.duplicates, 0)
    const setIds = new Set(entries.map((e) => e.card.set.id))
    const bySet = [...setIds].map((setId) => {
      const setEntries = entries.filter((e) => e.card.set.id === setId)
      const setInfo = setEntries[0]?.card.set
      return {
        setId,
        name: setInfo?.name ?? setId,
        owned: setEntries.length,
        total: setInfo?.printedTotal ?? 0,
      }
    })
    return { totalCards, uniqueCards, duplicates, setsTouched: setIds.size, bySet }
  }, [entries])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Minha Coleção</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe as cartas que você possui, deseja ou tem repetidas.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Library} label="Total de cartas" value={stats.totalCards} tone="brand" />
        <StatCard icon={Library} label="Cartas únicas" value={stats.uniqueCards} tone="leaf" />
        <StatCard icon={Library} label="Repetidas" value={stats.duplicates} tone="amber" />
        <StatCard icon={Library} label="Sets iniciados" value={stats.setsTouched} tone="violet" />
      </div>

      {stats.bySet.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Progresso por set</h3>
          <div className="flex flex-col gap-3">
            {stats.bySet.slice(0, 6).map((s) => (
              <div key={s.setId} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate font-semibold text-slate-600 dark:text-slate-300">{s.name}</span>
                <ProgressBar value={s.owned} max={s.total || 1} tone="leaf" />
                <span className="w-16 shrink-0 text-right text-xs text-slate-400">
                  {s.owned}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Tabs
          items={[
            { id: 'all', label: 'Todas', count: entries.length },
            { id: 'owned', label: 'Possuo', count: entries.filter((e) => e.status === 'owned').length },
            { id: 'wanted', label: 'Quero comprar', count: entries.filter((e) => e.status === 'wanted').length },
            { id: 'duplicate', label: 'Repetidas', count: entries.filter((e) => e.status === 'duplicate').length },
          ]}
          activeId={statusTab}
          onChange={(id) => setStatusTab(id as typeof statusTab)}
        />
        <Input icon={<Search className="h-4 w-4" />} placeholder="Pesquisar na coleção..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-64" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Sua coleção está vazia"
          description="Adicione cartas à sua coleção explorando o catálogo do Pokémon TCG."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <div
              key={entry.cardId}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
            >
              <img src={entry.card.images.small} alt={entry.card.name} className="h-20 w-14 shrink-0 rounded-lg object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{entry.card.name}</p>
                  <Badge tone="slate">{entry.card.set.name}</Badge>
                </div>
                <p className="text-xs text-slate-400">#{entry.card.number}</p>
                {entry.note && <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">"{entry.note}"</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                <Select value={entry.status} onChange={(e) => setStatus(entry.card, e.target.value as OwnershipStatus)} className="!w-auto text-xs">
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 px-2 py-1 dark:border-slate-700">
                  <button onClick={() => setQuantity(entry.cardId, Math.max(0, entry.quantity - 1))} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{entry.quantity}</span>
                  <button onClick={() => setQuantity(entry.cardId, entry.quantity + 1)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Select
                  value={entry.condition}
                  onChange={(e) => setCondition(entry.cardId, e.target.value as CardCondition)}
                  className="!w-auto text-xs"
                >
                  {CARD_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

                <input
                  placeholder="Observação..."
                  defaultValue={entry.note}
                  onBlur={(e) => setNote(entry.cardId, e.target.value)}
                  className="col-span-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 sm:col-span-1 sm:w-32"
                />

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

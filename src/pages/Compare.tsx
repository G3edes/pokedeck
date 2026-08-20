import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Scale, Search, X } from 'lucide-react'
import { getCards } from '@/api/pokemonTcgApi'
import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TypeBadge } from '@/components/cards/TypeBadge'
import { formatCurrency, getCardMarketPrice } from '@/lib/format'
import { cn } from '@/lib/cn'

function useHighlight(values: (number | undefined)[]) {
  const valid = values.filter((v): v is number => v !== undefined)
  const max = valid.length > 0 ? Math.max(...valid) : undefined
  const min = valid.length > 0 ? Math.min(...valid) : undefined
  return { max, min }
}

export function Compare() {
  const cards = useCompareStore((s) => s.cards)
  const toggle = useCompareStore((s) => s.toggle)
  const clear = useCompareStore((s) => s.clear)
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 400)

  const { data } = useQuery({
    queryKey: ['compare-search', debounced],
    queryFn: () => getCards({ query: debounced, pageSize: 8 }),
    enabled: debounced.trim().length >= 2,
  })

  const searchResults = (data?.data ?? []).filter((c) => !cards.some((sel) => sel.id === c.id))

  const hpValues = cards.map((c) => (c.hp ? Number(c.hp) : undefined))
  const hpHighlight = useHighlight(hpValues)
  const priceValues = cards.map((c) => getCardMarketPrice(c))
  const priceHighlight = useHighlight(priceValues)
  const retreatValues = cards.map((c) => c.convertedRetreatCost)
  const retreatHighlight = useHighlight(retreatValues)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Comparar Cartas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compare até {MAX_COMPARE} cartas lado a lado.</p>
        </div>
        {cards.length > 0 && (
          <Button variant="outline" onClick={clear}>
            Limpar comparação
          </Button>
        )}
      </div>

      <div className="relative mb-6 max-w-md">
        <Input icon={<Search className="h-4 w-4" />} placeholder="Buscar carta para adicionar..." value={term} onChange={(e) => setTerm(e.target.value)} />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {searchResults.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  if (cards.length >= MAX_COMPARE) return
                  toggle(card)
                  setTerm('')
                }}
                disabled={cards.length >= MAX_COMPARE}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <img src={card.images.small} alt="" className="h-10 w-7 rounded object-contain" />
                {card.name}
                <span className="ml-auto text-xs text-slate-400">{card.set.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={Scale} title="Nenhuma carta selecionada" description="Pesquise cartas acima para começar a comparar." />
      ) : (
        <div className="scrollbar-thin overflow-x-auto">
          <div className="grid min-w-[600px] gap-4" style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(220px, 1fr))` }}>
            {cards.map((card, index) => (
              <div key={card.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="relative">
                  <img src={card.images.small} alt={card.name} className="mx-auto h-48 object-contain" />
                  <button
                    onClick={() => toggle(card)}
                    className="absolute right-0 top-0 rounded-full bg-slate-900/70 p-1 text-white hover:bg-ember-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-center font-bold text-slate-900 dark:text-white">{card.name}</h3>

                <CompareRow label="HP" highlight={hpValues[index] === hpHighlight.max && hpHighlight.max !== undefined}>
                  {card.hp ?? '—'}
                </CompareRow>
                <CompareRow label="Tipo">
                  <div className="flex flex-wrap justify-center gap-1">
                    {card.types?.map((t) => <TypeBadge key={t} type={t} />) ?? '—'}
                  </div>
                </CompareRow>
                <CompareRow label="Raridade">{card.rarity ?? '—'}</CompareRow>
                <CompareRow
                  label="Custo de recuo"
                  highlight={retreatValues[index] === retreatHighlight.min && retreatHighlight.min !== undefined}
                >
                  {card.convertedRetreatCost ?? 0}
                </CompareRow>
                <CompareRow label="Fraquezas">
                  <div className="flex flex-wrap justify-center gap-1">
                    {card.weaknesses?.map((w) => <TypeBadge key={w.type} type={w.type} />) ?? '—'}
                  </div>
                </CompareRow>
                <CompareRow label="Resistências">
                  <div className="flex flex-wrap justify-center gap-1">
                    {card.resistances?.map((r) => <TypeBadge key={r.type} type={r.type} />) ?? 'Nenhuma'}
                  </div>
                </CompareRow>
                <CompareRow label="Ataques">
                  <div className="flex flex-col gap-1 text-xs">
                    {card.attacks?.map((a) => (
                      <div key={a.name} className="flex justify-between gap-2">
                        <span>{a.name}</span>
                        <span className="font-bold">{a.damage}</span>
                      </div>
                    )) ?? '—'}
                  </div>
                </CompareRow>
                <CompareRow
                  label="Preço aprox."
                  highlight={priceValues[index] === priceHighlight.max && priceHighlight.max !== undefined}
                >
                  {formatCurrency(priceValues[index])}
                </CompareRow>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CompareRow({ label, children, highlight }: { label: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg px-2 py-1.5 text-center text-sm', highlight && 'bg-leaf-50 font-bold text-leaf-700 dark:bg-leaf-500/10 dark:text-leaf-300')}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  )
}

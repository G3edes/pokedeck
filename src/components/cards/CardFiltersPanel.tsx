import { RotateCcw } from 'lucide-react'
import type { CardFilters, SortField, SortOrder, Supertype } from '@/types/pokemon'
import { ENERGY_TYPES, RARITIES } from '@/types/pokemon'
import { Select } from '@/components/ui/Input'
import { useSets } from '@/hooks/useCards'

interface CardFiltersPanelProps {
  filters: CardFilters
  onChange: (filters: CardFilters) => void
  onReset: () => void
}

const SUPERTYPES: Supertype[] = ['Pokémon', 'Trainer', 'Energy']

export function CardFiltersPanel({ filters, onChange, onReset }: CardFiltersPanelProps) {
  const { data: setsData } = useSets()
  const sets = setsData?.data ?? []
  const seriesOptions = [...new Set(sets.map((s) => s.series))]

  function update<K extends keyof CardFilters>(key: K, value: CardFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Filtros</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <RotateCcw className="h-3 w-3" /> Limpar
        </button>
      </div>

      <Select
        label="Categoria"
        value={filters.supertype ?? ''}
        onChange={(e) => update('supertype', (e.target.value || undefined) as Supertype | undefined)}
      >
        <option value="">Todas</option>
        {SUPERTYPES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select
        label="Tipo de energia"
        value={filters.types?.[0] ?? ''}
        onChange={(e) => update('types', e.target.value ? [e.target.value] : undefined)}
      >
        <option value="">Todos</option>
        {ENERGY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      <Select
        label="Raridade"
        value={filters.rarity ?? ''}
        onChange={(e) => update('rarity', e.target.value || undefined)}
      >
        <option value="">Todas</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>

      <Select
        label="Série"
        value={filters.series ?? ''}
        onChange={(e) => update('series', e.target.value || undefined)}
      >
        <option value="">Todas</option>
        {seriesOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select
        label="Set"
        value={filters.setId ?? ''}
        onChange={(e) => update('setId', e.target.value || undefined)}
      >
        <option value="">Todos</option>
        {sets
          .filter((s) => !filters.series || s.series === filters.series)
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="HP mín."
          value={filters.hpMin ?? ''}
          onChange={(e) => update('hpMin', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">—</option>
          {[30, 60, 90, 120, 150, 180, 220, 280].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
        <Select
          label="HP máx."
          value={filters.hpMax ?? ''}
          onChange={(e) => update('hpMax', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">—</option>
          {[60, 90, 120, 150, 180, 220, 280, 340].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Ordenar por"
          value={filters.sortField ?? 'name'}
          onChange={(e) => update('sortField', e.target.value as SortField)}
        >
          <option value="name">Nome</option>
          <option value="releaseDate">Data de lançamento</option>
          <option value="number">Número</option>
          <option value="hp">HP</option>
          <option value="price">Preço aproximado</option>
        </Select>
        <Select
          label="Direção"
          value={filters.sortOrder ?? 'asc'}
          onChange={(e) => update('sortOrder', e.target.value as SortOrder)}
        >
          <option value="asc">A → Z / Crescente</option>
          <option value="desc">Z → A / Decrescente</option>
        </Select>
      </div>
    </div>
  )
}

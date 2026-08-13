import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Layers, Package, Scale } from 'lucide-react'
import type { PokemonCard } from '@/types/pokemon'
import { TypeBadge } from './TypeBadge'
import { Badge } from '@/components/ui/Badge'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { getRarityTone } from '@/lib/energyTypes'
import { formatCurrency, getCardMarketPrice } from '@/lib/format'
import { toast } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

interface PokemonCardTileProps {
  card: PokemonCard
  onAddToDeck?: (card: PokemonCard) => void
  onCompareToggle?: (card: PokemonCard) => void
  isComparing?: boolean
  compareDisabled?: boolean
}

export function PokemonCardTile({
  card,
  onAddToDeck,
  onCompareToggle,
  isComparing,
  compareDisabled,
}: PokemonCardTileProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(card.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const inCollection = useCollectionStore((s) => s.has(card.id))
  const addOrUpdate = useCollectionStore((s) => s.addOrUpdate)
  const price = getCardMarketPrice(card)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    const added = toggleFavorite(card)
    toast.success(added ? 'Adicionada aos favoritos!' : 'Removida dos favoritos.', card.name)
  }

  const handleCollection = (e: React.MouseEvent) => {
    e.preventDefault()
    addOrUpdate(card)
    toast.success('Adicionada à coleção!', card.name)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/cards/${card.id}`} className="relative block aspect-[5/7] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {!imageLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={card.images.small}
          alt={card.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'h-full w-full object-contain p-2 transition-all duration-300 group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-slate-900/80 to-transparent p-3 transition-transform duration-200 group-hover:translate-y-0">
          <button
            onClick={handleFavorite}
            title="Favoritar"
            className={cn(
              'rounded-full p-2 backdrop-blur transition hover:scale-110',
              isFavorite ? 'bg-ember-500 text-white' : 'bg-white/90 text-slate-700',
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
          <button
            onClick={handleCollection}
            title="Adicionar à coleção"
            className={cn(
              'rounded-full p-2 backdrop-blur transition hover:scale-110',
              inCollection ? 'bg-leaf-500 text-white' : 'bg-white/90 text-slate-700',
            )}
          >
            <Package className="h-4 w-4" />
          </button>
          {onAddToDeck && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onAddToDeck(card)
              }}
              title="Adicionar ao deck"
              className="rounded-full bg-white/90 p-2 text-slate-700 backdrop-blur transition hover:scale-110 hover:bg-brand-500 hover:text-white"
            >
              <Layers className="h-4 w-4" />
            </button>
          )}
          {onCompareToggle && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onCompareToggle(card)
              }}
              disabled={compareDisabled}
              title="Comparar"
              className={cn(
                'rounded-full p-2 backdrop-blur transition hover:scale-110 disabled:opacity-40',
                isComparing ? 'bg-violet-500 text-white' : 'bg-white/90 text-slate-700',
              )}
            >
              <Scale className="h-4 w-4" />
            </button>
          )}
        </div>
        {card.rarity && (
          <div className="absolute left-2 top-2">
            <Badge tone={getRarityTone(card.rarity)}>{card.rarity}</Badge>
          </div>
        )}
      </Link>
      <Link to={`/cards/${card.id}`} className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">{card.name}</h3>
          {card.hp && <span className="shrink-0 text-xs font-bold text-ember-600 dark:text-ember-400">{card.hp} HP</span>}
        </div>
        <div className="flex flex-wrap gap-1">
          {card.types?.map((type) => <TypeBadge key={type} type={type} />)}
          {!card.types?.length && <TypeBadge type={card.supertype} />}
        </div>
        <div className="mt-auto flex items-center justify-between pt-1.5 text-xs text-slate-400">
          <span className="line-clamp-1">
            {card.set.name} · #{card.number}
          </span>
          <span className="shrink-0 font-semibold text-slate-600 dark:text-slate-300">
            {formatCurrency(price)}
          </span>
        </div>
      </Link>
    </div>
  )
}

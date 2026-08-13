import type { PokemonCard } from '@/types/pokemon'
import { PokemonCardTile } from './PokemonCardTile'
import { CardTileSkeleton } from '@/components/ui/Skeleton'

interface CardGridProps {
  cards: PokemonCard[]
  isLoading?: boolean
  skeletonCount?: number
  onAddToDeck?: (card: PokemonCard) => void
  onCompareToggle?: (card: PokemonCard) => void
  compareIds?: string[]
  compareLimitReached?: boolean
}

export function CardGrid({
  cards,
  isLoading,
  skeletonCount = 12,
  onAddToDeck,
  onCompareToggle,
  compareIds = [],
  compareLimitReached = false,
}: CardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.id} className="animate-fade-in">
          <PokemonCardTile
            card={card}
            onAddToDeck={onAddToDeck}
            onCompareToggle={onCompareToggle}
            isComparing={compareIds.includes(card.id)}
            compareDisabled={compareLimitReached && !compareIds.includes(card.id)}
          />
        </div>
      ))}
      {isLoading &&
        Array.from({ length: skeletonCount }).map((_, i) => <CardTileSkeleton key={`skeleton-${i}`} />)}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { getCards } from '@/api/pokemonTcgApi'
import type { Deck } from '@/types/deck'

/**
 * Suggests cards that could fit a deck, based on the Pokémon types already
 * present in it. A simple content-based heuristic — not a machine-learning
 * recommendation.
 */
export function useDeckRecommendations(deck: Deck | undefined) {
  const types = deck
    ? [...new Set(deck.cards.flatMap((entry) => entry.card.types ?? []))].slice(0, 2)
    : []

  return useQuery({
    queryKey: ['deck-recommendations', deck?.id, types],
    queryFn: async () => {
      if (types.length === 0) return []
      const result = await getCards({ types, supertype: 'Pokémon', pageSize: 16 })
      const ownedIds = new Set(deck?.cards.map((e) => e.card.id))
      return result.data.filter((card) => !ownedIds.has(card.id)).slice(0, 10)
    },
    enabled: Boolean(deck) && types.length > 0,
    staleTime: 1000 * 60 * 10,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getCards, getCardsByIds } from '@/api/pokemonTcgApi'
import { useHistoryStore } from '@/store/useHistoryStore'

export function useCatalogSize() {
  return useQuery({
    queryKey: ['catalog-size'],
    queryFn: () => getCards({ pageSize: 1 }),
    staleTime: 1000 * 60 * 60,
    select: (data) => data.totalCount,
  })
}

export function useFeaturedCards() {
  return useQuery({
    queryKey: ['featured-cards'],
    queryFn: () => getCards({ sortField: 'releaseDate', sortOrder: 'desc', pageSize: 8 }),
    staleTime: 1000 * 60 * 30,
    select: (data) => data.data,
  })
}

export function usePopularCards() {
  return useQuery({
    queryKey: ['popular-cards'],
    queryFn: () => getCards({ rarity: 'Rare Holo', pageSize: 8 }),
    staleTime: 1000 * 60 * 30,
    select: (data) => data.data,
  })
}

export function useRecentlyViewedCards() {
  const recentlyViewed = useHistoryStore((s) => s.recentlyViewed)
  const ids = recentlyViewed.slice(0, 8).map((v) => v.cardId)

  return useQuery({
    queryKey: ['recently-viewed-cards', ids],
    queryFn: () => getCardsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 10,
    select: (cards) => ids.map((id) => cards.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
  })
}

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getCardById, getCards, getRelatedCards, getSetById, getSets } from '@/api/pokemonTcgApi'
import type { CardFilters, PokemonCard } from '@/types/pokemon'

const PAGE_SIZE = 24

export function useInfiniteCards(filters: Omit<CardFilters, 'page' | 'pageSize'>) {
  return useInfiniteQuery({
    queryKey: ['cards', filters],
    queryFn: ({ pageParam }) => getCards({ ...filters, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.totalCount ? lastPage.page + 1 : undefined
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRelatedCards(card: PokemonCard | undefined) {
  return useQuery({
    queryKey: ['related-cards', card?.id],
    queryFn: () => getRelatedCards(card as PokemonCard),
    enabled: Boolean(card),
    staleTime: 1000 * 60 * 10,
  })
}

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn: () => getSets(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useSet(id: string | undefined) {
  return useQuery({
    queryKey: ['set', id],
    queryFn: () => getSetById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  })
}

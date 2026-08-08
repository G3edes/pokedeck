import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PokemonCard } from '@/types/pokemon'

const MAX_COMPARE = 4

interface CompareState {
  cards: PokemonCard[]
  toggle: (card: PokemonCard) => void
  remove: (cardId: string) => void
  clear: () => void
  isFull: boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      cards: [],
      isFull: false,
      toggle: (card) =>
        set((state) => {
          const exists = state.cards.some((c) => c.id === card.id)
          const next = exists
            ? state.cards.filter((c) => c.id !== card.id)
            : state.cards.length < MAX_COMPARE
              ? [...state.cards, card]
              : state.cards
          return { cards: next, isFull: next.length >= MAX_COMPARE }
        }),
      remove: (cardId) =>
        set((state) => {
          const next = state.cards.filter((c) => c.id !== cardId)
          return { cards: next, isFull: next.length >= MAX_COMPARE }
        }),
      clear: () => set({ cards: [], isFull: false }),
    }),
    { name: 'pokedeck-compare' },
  ),
)

export { MAX_COMPARE }

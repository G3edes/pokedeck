import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecentlyViewedCard, RecentSearch } from '@/types/user'
import { generateId } from '@/lib/format'

const MAX_ENTRIES = 20

interface HistoryState {
  recentSearches: RecentSearch[]
  recentlyViewed: RecentlyViewedCard[]
  addSearch: (term: string) => void
  clearSearches: () => void
  removeSearch: (id: string) => void
  addViewedCard: (cardId: string) => void
  clearViewed: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      recentSearches: [],
      recentlyViewed: [],
      addSearch: (term) =>
        set((state) => {
          const trimmed = term.trim()
          if (!trimmed) return state
          const deduped = state.recentSearches.filter(
            (s) => s.term.toLowerCase() !== trimmed.toLowerCase(),
          )
          const next = [
            { id: generateId(), term: trimmed, searchedAt: new Date().toISOString() },
            ...deduped,
          ].slice(0, MAX_ENTRIES)
          return { recentSearches: next }
        }),
      clearSearches: () => set({ recentSearches: [] }),
      removeSearch: (id) =>
        set((state) => ({ recentSearches: state.recentSearches.filter((s) => s.id !== id) })),
      addViewedCard: (cardId) =>
        set((state) => {
          const deduped = state.recentlyViewed.filter((v) => v.cardId !== cardId)
          const next = [{ cardId, viewedAt: new Date().toISOString() }, ...deduped].slice(
            0,
            MAX_ENTRIES,
          )
          return { recentlyViewed: next }
        }),
      clearViewed: () => set({ recentlyViewed: [] }),
    }),
    { name: 'pokedeck-history' },
  ),
)

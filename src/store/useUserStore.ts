import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types/user'

const AVATAR_OPTIONS = [
  'https://images.pokemontcg.io/base1/4.png',
  'https://images.pokemontcg.io/base1/58.png',
  'https://images.pokemontcg.io/base1/25.png',
  'https://images.pokemontcg.io/base1/2.png',
]

interface UserState {
  profile: UserProfile
  updateProfile: (changes: Partial<UserProfile>) => void
}

export const DEFAULT_AVATARS = AVATAR_OPTIONS

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Treinador Pokémon',
        avatar: AVATAR_OPTIONS[0] ?? '',
        bio: 'Colecionador de cartas e construtor de decks.',
        createdAt: new Date().toISOString(),
        language: 'pt-BR',
      },
      updateProfile: (changes) =>
        set((state) => ({ profile: { ...state.profile, ...changes } })),
    }),
    { name: 'pokedeck-user' },
  ),
)

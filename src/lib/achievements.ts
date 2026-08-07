import type { Achievement } from '@/types/user'

export interface AchievementContext {
  deckCount: number
  cardCount: number
  favoriteCount: number
  collectionUniqueCount: number
  completedSets: number
  highestDeckScore: number
}

interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  isUnlocked: (ctx: AchievementContext) => boolean
}

const DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-deck',
    title: 'Primeiro Deck',
    description: 'Crie o seu primeiro deck.',
    icon: 'Trophy',
    isUnlocked: (ctx) => ctx.deckCount >= 1,
  },
  {
    id: 'deck-master-10',
    title: '10 Decks',
    description: 'Construa 10 decks diferentes.',
    icon: 'Layers',
    isUnlocked: (ctx) => ctx.deckCount >= 10,
  },
  {
    id: 'collector-100',
    title: '100 Cartas',
    description: 'Adicione 100 cartas à sua coleção.',
    icon: 'Package',
    isUnlocked: (ctx) => ctx.cardCount >= 100,
  },
  {
    id: 'collector-master',
    title: 'Colecionador',
    description: 'Tenha 50 cartas únicas na sua coleção.',
    icon: 'Gem',
    isUnlocked: (ctx) => ctx.collectionUniqueCount >= 50,
  },
  {
    id: 'set-master',
    title: 'Mestre dos Sets',
    description: 'Complete a coleção de um set inteiro.',
    icon: 'Award',
    isUnlocked: (ctx) => ctx.completedSets >= 1,
  },
  {
    id: 'favorite-fan',
    title: 'Fã Número Um',
    description: 'Favorite 20 cartas.',
    icon: 'Heart',
    isUnlocked: (ctx) => ctx.favoriteCount >= 20,
  },
  {
    id: 'top-strategist',
    title: 'Estrategista',
    description: 'Alcance um Deck Score de 90 ou mais.',
    icon: 'Sparkles',
    isUnlocked: (ctx) => ctx.highestDeckScore >= 90,
  },
]

export function computeAchievements(ctx: AchievementContext): Achievement[] {
  return DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: def.isUnlocked(ctx) ? new Date().toISOString() : undefined,
  }))
}

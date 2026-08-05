/**
 * Type definitions mirroring the shape of the Pokémon TCG API (v2)
 * @see https://docs.pokemontcg.io/
 */

export type Supertype = 'Pokémon' | 'Trainer' | 'Energy'

export interface CardAbility {
  name: string
  text: string
  type: string
}

export interface CardAttack {
  name: string
  cost: string[]
  convertedEnergyCost: number
  damage: string
  text: string
}

export interface CardWeakness {
  type: string
  value: string
}

export interface CardResistance {
  type: string
  value: string
}

export interface SetImages {
  symbol: string
  logo: string
}

export interface CardSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities: Record<string, string>
  ptcgoCode?: string
  releaseDate: string
  updatedAt: string
  images: SetImages
}

export interface CardImages {
  small: string
  large: string
}

export interface TcgPlayerPrice {
  low?: number
  mid?: number
  high?: number
  market?: number
  directLow?: number
}

export interface TcgPlayer {
  url: string
  updatedAt: string
  prices?: Record<string, TcgPlayerPrice>
}

export interface CardMarketPrice {
  averageSellPrice?: number
  lowPrice?: number
  trendPrice?: number
  avg1?: number
  avg7?: number
  avg30?: number
}

export interface CardMarket {
  url: string
  updatedAt: string
  prices?: CardMarketPrice
}

export interface PokemonCard {
  id: string
  name: string
  supertype: Supertype
  subtypes?: string[]
  level?: string
  hp?: string
  types?: string[]
  evolvesFrom?: string
  evolvesTo?: string[]
  rules?: string[]
  abilities?: CardAbility[]
  attacks?: CardAttack[]
  weaknesses?: CardWeakness[]
  resistances?: CardResistance[]
  retreatCost?: string[]
  convertedRetreatCost?: number
  set: CardSet
  number: string
  artist?: string
  rarity?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities: Record<string, string>
  images: CardImages
  tcgplayer?: TcgPlayer
  cardmarket?: CardMarket
}

export interface ApiListResponse<T> {
  data: T[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

export interface ApiSingleResponse<T> {
  data: T
}

export type SortOrder = 'asc' | 'desc'

export type SortField =
  | 'name'
  | 'releaseDate'
  | 'price'
  | 'number'
  | 'hp'

export interface CardFilters {
  query?: string
  name?: string
  types?: string[]
  subtypes?: string[]
  supertype?: Supertype
  rarity?: string
  setId?: string
  series?: string
  hpMin?: number
  hpMax?: number
  artist?: string
  sortField?: SortField
  sortOrder?: SortOrder
  page?: number
  pageSize?: number
}

export const ENERGY_TYPES = [
  'Colorless',
  'Darkness',
  'Dragon',
  'Fairy',
  'Fighting',
  'Fire',
  'Grass',
  'Lightning',
  'Metal',
  'Psychic',
  'Water',
] as const

export type EnergyType = (typeof ENERGY_TYPES)[number]

export const RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Ultra',
  'Rare Secret',
  'Rare Rainbow',
  'Amazing Rare',
  'Promo',
] as const

export const POKEMON_SUBTYPES = [
  'Basic',
  'Stage 1',
  'Stage 2',
  'BREAK',
  'EX',
  'GX',
  'V',
  'VMAX',
  'VSTAR',
  'MEGA',
  "ex",
  'Restored',
  'LEGEND',
]

export const TRAINER_SUBTYPES = [
  'Item',
  'Supporter',
  'Stadium',
  'Tool',
  'ACE SPEC',
]

export const ENERGY_SUBTYPES = ['Basic', 'Special']

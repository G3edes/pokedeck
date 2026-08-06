import { apiClient } from './client'
import type {
  ApiListResponse,
  ApiSingleResponse,
  CardFilters,
  CardSet,
  PokemonCard,
} from '@/types/pokemon'

/**
 * Builds the Lucene-style `q` query string the Pokémon TCG API expects,
 * e.g. `name:pikachu* supertype:Pokémon types:fire`.
 */
function buildCardQuery(filters: CardFilters): string {
  const clauses: string[] = []

  if (filters.query) {
    const term = filters.query.trim()
    if (term) {
      clauses.push(`(name:"*${term}*" OR number:"${term}")`)
    }
  }
  if (filters.name) clauses.push(`name:"*${filters.name}*"`)
  if (filters.supertype) clauses.push(`supertype:"${filters.supertype}"`)
  if (filters.types?.length) {
    clauses.push(`(${filters.types.map((t) => `types:"${t}"`).join(' OR ')})`)
  }
  if (filters.subtypes?.length) {
    clauses.push(`(${filters.subtypes.map((t) => `subtypes:"${t}"`).join(' OR ')})`)
  }
  if (filters.rarity) clauses.push(`rarity:"${filters.rarity}"`)
  if (filters.setId) clauses.push(`set.id:"${filters.setId}"`)
  if (filters.series) clauses.push(`set.series:"${filters.series}"`)
  if (filters.artist) clauses.push(`artist:"*${filters.artist}*"`)
  if (filters.hpMin !== undefined) clauses.push(`hp:[${filters.hpMin} TO *]`)
  if (filters.hpMax !== undefined) clauses.push(`hp:[* TO ${filters.hpMax}]`)

  return clauses.join(' ')
}

function buildOrderBy(filters: CardFilters): string | undefined {
  if (!filters.sortField) return undefined
  const map: Record<string, string> = {
    name: 'name',
    releaseDate: 'set.releaseDate',
    number: 'number',
    hp: 'hp',
    price: 'name',
  }
  const field = map[filters.sortField] ?? 'name'
  return filters.sortOrder === 'desc' ? `-${field}` : field
}

export async function getCards(
  filters: CardFilters = {},
): Promise<ApiListResponse<PokemonCard>> {
  const q = buildCardQuery(filters)
  const orderBy = buildOrderBy(filters)

  const { data } = await apiClient.get<ApiListResponse<PokemonCard>>('/cards', {
    params: {
      q: q || undefined,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 24,
      orderBy,
    },
  })
  return data
}

export async function getCardById(id: string): Promise<PokemonCard> {
  const { data } = await apiClient.get<ApiSingleResponse<PokemonCard>>(`/cards/${id}`)
  return data.data
}

export async function searchCards(
  filters: CardFilters,
): Promise<ApiListResponse<PokemonCard>> {
  return getCards(filters)
}

export async function getCardsByIds(ids: string[]): Promise<PokemonCard[]> {
  if (ids.length === 0) return []
  const q = ids.map((id) => `id:"${id}"`).join(' OR ')
  const { data } = await apiClient.get<ApiListResponse<PokemonCard>>('/cards', {
    params: { q, pageSize: ids.length },
  })
  return data.data
}

export async function getSets(params?: {
  page?: number
  pageSize?: number
  orderBy?: string
}): Promise<ApiListResponse<CardSet>> {
  const { data } = await apiClient.get<ApiListResponse<CardSet>>('/sets', {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      orderBy: params?.orderBy ?? '-releaseDate',
    },
  })
  return data
}

export async function getSetById(id: string): Promise<CardSet> {
  const { data } = await apiClient.get<ApiSingleResponse<CardSet>>(`/sets/${id}`)
  return data.data
}

export async function getRelatedCards(card: PokemonCard): Promise<PokemonCard[]> {
  const clauses = [`set.id:"${card.set.id}"`, `-id:"${card.id}"`]
  if (card.nationalPokedexNumbers?.length) {
    clauses.push(`OR nationalPokedexNumbers:${card.nationalPokedexNumbers[0]}`)
  }
  const { data } = await apiClient.get<ApiListResponse<PokemonCard>>('/cards', {
    params: { q: clauses.join(' '), pageSize: 12 },
  })
  return data.data
}

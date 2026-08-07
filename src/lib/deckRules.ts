import type { DeckFormat } from '@/types/deck'

export interface FormatRules {
  totalCards: number
  maxCopiesPerCard: number
  unlimitedBasicEnergy: boolean
  description: string
}

export const FORMAT_RULES: Record<DeckFormat, FormatRules> = {
  Standard: {
    totalCards: 60,
    maxCopiesPerCard: 4,
    unlimitedBasicEnergy: true,
    description: 'Rotação vigente da Pokémon TCG — 60 cartas, até 4 cópias por carta.',
  },
  Expanded: {
    totalCards: 60,
    maxCopiesPerCard: 4,
    unlimitedBasicEnergy: true,
    description: 'Pool ampliado de sets — 60 cartas, até 4 cópias por carta.',
  },
  Unlimited: {
    totalCards: 60,
    maxCopiesPerCard: 4,
    unlimitedBasicEnergy: true,
    description: 'Todos os sets já lançados — 60 cartas, até 4 cópias por carta.',
  },
  GLC: {
    totalCards: 60,
    maxCopiesPerCard: 1,
    unlimitedBasicEnergy: true,
    description: 'Gym Leader Challenge — singleton, 1 cópia por carta (exceto energias básicas).',
  },
  Casual: {
    totalCards: 60,
    maxCopiesPerCard: 99,
    unlimitedBasicEnergy: true,
    description: 'Modo livre, sem restrições oficiais — jogue do seu jeito.',
  },
}

export function isBasicEnergy(supertype: string, subtypes?: string[]): boolean {
  if (supertype !== 'Energy') return false
  return !subtypes?.length || subtypes.includes('Basic')
}

export function maxCopiesAllowed(
  format: DeckFormat,
  supertype: string,
  subtypes?: string[],
): number {
  const rules = FORMAT_RULES[format]
  if (rules.unlimitedBasicEnergy && isBasicEnergy(supertype, subtypes)) return Infinity
  return rules.maxCopiesPerCard
}

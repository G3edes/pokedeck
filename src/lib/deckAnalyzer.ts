import type { DeckAnalysis, DeckCardEntry, DeckFormat } from '@/types/deck'
import { FORMAT_RULES } from './deckRules'

/**
 * Heuristic deck analysis. These are informal guidelines inspired by common
 * deckbuilding wisdom, not official Pokémon TCG rules or a competitive tier list.
 */
export function analyzeDeck(entries: DeckCardEntry[], format: DeckFormat): DeckAnalysis {
  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0)

  const categoryCounts = { pokemon: 0, trainer: 0, energy: 0, total: totalCards }
  const typeDistribution: Record<string, number> = {}
  const rarityDistribution: Record<string, number> = {}
  const energyDistribution: Record<string, number> = {}
  const retreatCurve: Record<number, number> = {}
  let hpSum = 0
  let hpCount = 0
  let retreatSum = 0
  let retreatCount = 0

  for (const { card, quantity } of entries) {
    if (card.supertype === 'Pokémon') {
      categoryCounts.pokemon += quantity
      for (const type of card.types ?? []) {
        typeDistribution[type] = (typeDistribution[type] ?? 0) + quantity
      }
      if (card.hp) {
        const hpValue = Number.parseInt(card.hp, 10)
        if (!Number.isNaN(hpValue)) {
          hpSum += hpValue * quantity
          hpCount += quantity
        }
      }
      const retreat = card.convertedRetreatCost ?? 0
      retreatSum += retreat * quantity
      retreatCount += quantity
      retreatCurve[retreat] = (retreatCurve[retreat] ?? 0) + quantity
    } else if (card.supertype === 'Trainer') {
      categoryCounts.trainer += quantity
    } else if (card.supertype === 'Energy') {
      categoryCounts.energy += quantity
      const label = card.name
      energyDistribution[label] = (energyDistribution[label] ?? 0) + quantity
    }

    if (card.rarity) {
      rarityDistribution[card.rarity] = (rarityDistribution[card.rarity] ?? 0) + quantity
    }
  }

  const averageHp = hpCount > 0 ? Math.round(hpSum / hpCount) : 0
  const averageConvertedRetreatCost =
    retreatCount > 0 ? Number((retreatSum / retreatCount).toFixed(1)) : 0

  const { score, breakdown, recommendations } = scoreDeck({
    categoryCounts,
    format,
    typeDistribution,
    averageConvertedRetreatCost,
  })

  return {
    categoryCounts,
    typeDistribution,
    rarityDistribution,
    energyDistribution,
    retreatCurve,
    averageHp,
    averageConvertedRetreatCost,
    score,
    scoreBreakdown: breakdown,
    recommendations,
  }
}

interface ScoreInput {
  categoryCounts: DeckAnalysis['categoryCounts']
  format: DeckFormat
  typeDistribution: Record<string, number>
  averageConvertedRetreatCost: number
}

function scoreDeck({ categoryCounts, format, typeDistribution, averageConvertedRetreatCost }: ScoreInput) {
  const rules = FORMAT_RULES[format]
  const { pokemon, trainer, energy, total } = categoryCounts
  const recommendations: string[] = []
  const breakdown: { label: string; points: number; max: number }[] = []

  // 1. Completeness — deck should be at the target size (25 pts)
  const completenessRatio = rules.totalCards > 0 ? Math.min(total / rules.totalCards, 1) : 0
  const completenessPoints = Math.round(completenessRatio * 25)
  breakdown.push({ label: 'Tamanho do deck', points: completenessPoints, max: 25 })
  if (total < rules.totalCards) {
    recommendations.push(
      `Seu deck tem ${total} carta${total === 1 ? '' : 's'} de ${rules.totalCards} recomendadas.`,
    )
  }

  // 2. Energy ratio — typically 12-16 energy in a 60-card deck (20 pts)
  const energyRatio = total > 0 ? energy / total : 0
  const idealEnergyRatio = 0.23
  const energyDiff = Math.abs(energyRatio - idealEnergyRatio)
  const energyPoints = Math.max(0, Math.round(20 - energyDiff * 100))
  breakdown.push({ label: 'Proporção de energias', points: energyPoints, max: 20 })
  if (energyRatio < 0.15 && total > 0) {
    recommendations.push('Seu deck possui poucas cartas de energia. Considere adicionar mais.')
  } else if (energyRatio > 0.35 && total > 0) {
    recommendations.push('Seu deck possui muitas energias. Isso pode reduzir a consistência.')
  }

  // 3. Trainer ratio — support cards drive consistency (20 pts)
  const trainerRatio = total > 0 ? trainer / total : 0
  const idealTrainerRatio = 0.33
  const trainerDiff = Math.abs(trainerRatio - idealTrainerRatio)
  const trainerPoints = Math.max(0, Math.round(20 - trainerDiff * 90))
  breakdown.push({ label: 'Cartas de treinador', points: trainerPoints, max: 20 })
  if (trainerRatio < 0.2 && total > 0) {
    recommendations.push('Considere adicionar mais cartas de treinador para aumentar a consistência.')
  }

  // 4. Type consistency — fewer distinct types is usually more consistent (15 pts)
  const distinctTypes = Object.keys(typeDistribution).length
  const typePoints = distinctTypes <= 1 ? 15 : distinctTypes === 2 ? 12 : distinctTypes === 3 ? 7 : 3
  breakdown.push({ label: 'Consistência de tipos', points: typePoints, max: 15 })
  if (distinctTypes >= 4) {
    recommendations.push(
      'Seu deck combina muitos tipos de Pokémon diferentes, o que pode dificultar a curva de energias.',
    )
  }

  // 5. Pokémon count sanity (10 pts)
  const pokemonRatio = total > 0 ? pokemon / total : 0
  const pokemonPoints = pokemonRatio >= 0.15 && pokemonRatio <= 0.35 ? 10 : 5
  breakdown.push({ label: 'Quantidade de Pokémon', points: pokemonPoints, max: 10 })
  if (pokemonRatio > 0.45 && total > 0) {
    recommendations.push('Você possui muitos Pokémon básicos ou de evolução. Avalie o equilíbrio com treinadores.')
  }

  // 6. Retreat cost curve (10 pts)
  const retreatPoints = averageConvertedRetreatCost <= 2 ? 10 : averageConvertedRetreatCost <= 3 ? 6 : 3
  breakdown.push({ label: 'Custo médio de recuo', points: retreatPoints, max: 10 })
  if (averageConvertedRetreatCost > 2.5 && total > 0) {
    recommendations.push('O custo médio de recuo dos seus Pokémon está alto — considere opções mais ágeis.')
  }

  if (recommendations.length === 0 && total > 0) {
    recommendations.push('Seu deck está bem equilibrado com base nas heurísticas analisadas!')
  }

  const score = breakdown.reduce((sum, b) => sum + b.points, 0)

  return { score: Math.min(100, score), breakdown, recommendations }
}

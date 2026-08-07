import type { Deck, DeckCardEntry } from '@/types/deck'

export interface DeckExportPayload {
  format: 'pokedeck-v1'
  exportedAt: string
  deck: Deck
}

export function exportDeckAsJson(deck: Deck): string {
  const payload: DeckExportPayload = {
    format: 'pokedeck-v1',
    exportedAt: new Date().toISOString(),
    deck,
  }
  return JSON.stringify(payload, null, 2)
}

export function exportDeckAsTxt(deck: Deck): string {
  const lines: string[] = [`${deck.name}`, `Formato: ${deck.format}`, '']
  const groups: Record<string, DeckCardEntry[]> = { Pokémon: [], Trainer: [], Energy: [] }
  for (const entry of deck.cards) {
    groups[entry.card.supertype]?.push(entry)
  }
  for (const [label, entries] of Object.entries(groups)) {
    if (entries.length === 0) continue
    const count = entries.reduce((sum, e) => sum + e.quantity, 0)
    lines.push(`${label} (${count})`)
    for (const entry of entries) {
      lines.push(`${entry.quantity}x ${entry.card.name} — ${entry.card.set.name} ${entry.card.number}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

export function exportDeckAsCsv(deck: Deck): string {
  const header = ['Quantidade', 'Nome', 'Categoria', 'Set', 'Número', 'Raridade']
  const rows = deck.cards.map((entry) => [
    entry.quantity.toString(),
    entry.card.name,
    entry.card.supertype,
    entry.card.set.name,
    entry.card.number,
    entry.card.rarity ?? '',
  ])
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n')
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface ImportValidationResult {
  valid: boolean
  error?: string
  deck?: Deck
}

export function parseDeckImport(raw: string): ImportValidationResult {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { valid: false, error: 'O arquivo não contém um JSON válido.' }
  }

  const payload = json as Partial<DeckExportPayload> & { deck?: Partial<Deck> }
  const deck = payload.deck ?? (json as Partial<Deck>)

  if (!deck || typeof deck !== 'object') {
    return { valid: false, error: 'Estrutura de deck inválida.' }
  }
  if (typeof deck.name !== 'string' || !deck.name.trim()) {
    return { valid: false, error: 'O deck precisa ter um nome.' }
  }
  if (!Array.isArray(deck.cards)) {
    return { valid: false, error: 'O deck precisa conter uma lista de cartas.' }
  }
  for (const entry of deck.cards) {
    if (!entry || typeof entry !== 'object' || !('card' in entry) || !('quantity' in entry)) {
      return { valid: false, error: 'Uma ou mais cartas do deck estão em formato inválido.' }
    }
  }

  return { valid: true, deck: deck as Deck }
}

export interface EnergyTypeStyle {
  bg: string
  text: string
  hex: string
}

const DEFAULT_STYLE: EnergyTypeStyle = { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-200', hex: '#94a3b8' }

const TYPE_STYLES: Record<string, EnergyTypeStyle> = {
  Colorless: { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-200', hex: '#a8a878' },
  Darkness: { bg: 'bg-slate-800', text: 'text-white', hex: '#4b4b4b' },
  Dragon: { bg: 'bg-amber-700', text: 'text-white', hex: '#a891ec' },
  Fairy: { bg: 'bg-pink-300', text: 'text-pink-900', hex: '#ee99ac' },
  Fighting: { bg: 'bg-orange-700', text: 'text-white', hex: '#c22e28' },
  Fire: { bg: 'bg-ember-500', text: 'text-white', hex: '#ff7033' },
  Grass: { bg: 'bg-leaf-500', text: 'text-white', hex: '#45bd75' },
  Lightning: { bg: 'bg-yellow-400', text: 'text-yellow-950', hex: '#f5cf49' },
  Metal: { bg: 'bg-slate-400', text: 'text-slate-950', hex: '#a8a8b8' },
  Psychic: { bg: 'bg-purple-500', text: 'text-white', hex: '#a56fc7' },
  Water: { bg: 'bg-sky-500', text: 'text-white', hex: '#4a90d9' },
}

export function getEnergyTypeStyle(type: string | undefined): EnergyTypeStyle {
  if (!type) return DEFAULT_STYLE
  return TYPE_STYLES[type] ?? DEFAULT_STYLE
}

export function getEnergyTypeHex(type: string): string {
  return TYPE_STYLES[type]?.hex ?? DEFAULT_STYLE.hex
}

const RARITY_TONES: Record<string, 'slate' | 'brand' | 'violet' | 'amber' | 'rose'> = {
  Common: 'slate',
  Uncommon: 'brand',
  Rare: 'violet',
  'Rare Holo': 'violet',
  'Rare Ultra': 'amber',
  'Rare Secret': 'rose',
  'Rare Rainbow': 'rose',
  Promo: 'amber',
}

export function getRarityTone(rarity: string | undefined) {
  if (!rarity) return 'slate' as const
  return RARITY_TONES[rarity] ?? ('violet' as const)
}

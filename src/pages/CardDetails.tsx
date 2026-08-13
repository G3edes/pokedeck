import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Heart,
  Layers,
  Package,
  Scale,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useCard, useRelatedCards } from '@/hooks/useCards'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TypeBadge } from '@/components/cards/TypeBadge'
import { PokemonCardTile } from '@/components/cards/PokemonCardTile'
import { AddToDeckModal } from '@/components/cards/AddToDeckModal'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore'
import { toast } from '@/store/useToastStore'
import { formatCurrency, getCardMarketPrice } from '@/lib/format'
import { getRarityTone } from '@/lib/energyTypes'

export function CardDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: card, isLoading, isError } = useCard(id)
  const { data: relatedCards } = useRelatedCards(card)
  const [deckModalOpen, setDeckModalOpen] = useState(false)

  const isFavorite = useFavoritesStore((s) => (card ? s.isFavorite(card.id) : false))
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const inCollection = useCollectionStore((s) => (card ? s.has(card.id) : false))
  const addOrUpdate = useCollectionStore((s) => s.addOrUpdate)
  const addViewedCard = useHistoryStore((s) => s.addViewedCard)
  const compareCards = useCompareStore((s) => s.cards)
  const toggleCompare = useCompareStore((s) => s.toggle)

  useEffect(() => {
    if (card) addViewedCard(card.id)
  }, [card, addViewedCard])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
          <Skeleton className="aspect-[5/7] w-full rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !card) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Carta não encontrada"
        description="Não foi possível carregar os detalhes desta carta."
        action={<Button onClick={() => navigate('/cards')}>Voltar para exploração</Button>}
      />
    )
  }

  const price = getCardMarketPrice(card)
  const isComparing = compareCards.some((c) => c.id === card.id)

  const handleShare = () => {
    const url = `${window.location.origin}/cards/${card.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    toast.success('Link copiado!', url)
  }

  const handleCompare = () => {
    if (!isComparing && compareCards.length >= MAX_COMPARE) {
      toast.warning(`Você só pode comparar até ${MAX_COMPARE} cartas.`)
      return
    }
    toggleCompare(card)
    if (!isComparing) toast.success('Adicionada ao comparador!', card.name)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-4 shadow-card dark:from-slate-800 dark:to-slate-900">
            <img src={card.images.large} alt={card.name} className="w-full rounded-xl" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <ActionButton icon={Heart} active={isFavorite} label="Favoritar" onClick={() => {
              const added = toggleFavorite(card)
              toast.success(added ? 'Adicionada aos favoritos!' : 'Removida dos favoritos.', card.name)
            }} />
            <ActionButton icon={Package} active={inCollection} label="Coleção" onClick={() => {
              addOrUpdate(card)
              toast.success('Adicionada à coleção!', card.name)
            }} />
            <ActionButton icon={Layers} label="Deck" onClick={() => setDeckModalOpen(true)} />
            <ActionButton icon={Scale} active={isComparing} label="Comparar" onClick={handleCompare} />
          </div>
          <Button variant="outline" className="mt-2 w-full" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">{card.name}</h1>
              {card.hp && <span className="text-lg font-bold text-ember-600 dark:text-ember-400">{card.hp} HP</span>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {card.types?.map((t) => <TypeBadge key={t} type={t} size="md" />)}
              {card.subtypes?.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
              {card.rarity && <Badge tone={getRarityTone(card.rarity)}>{card.rarity}</Badge>}
            </div>
            {card.evolvesFrom && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Evolui de <span className="font-semibold">{card.evolvesFrom}</span>
              </p>
            )}
          </div>

          {card.abilities && card.abilities.length > 0 && (
            <Section title="Habilidades">
              {card.abilities.map((ability) => (
                <div key={ability.name} className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <p className="font-bold text-violet-800 dark:text-violet-300">{ability.name}</p>
                    <Badge tone="violet">{ability.type}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{ability.text}</p>
                </div>
              ))}
            </Section>
          )}

          {card.attacks && card.attacks.length > 0 && (
            <Section title="Ataques">
              {card.attacks.map((attack) => (
                <div key={attack.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <p className="font-bold text-slate-800 dark:text-slate-100">{attack.name}</p>
                      <div className="flex gap-1">
                        {attack.cost.map((c, i) => <TypeBadge key={`${c}-${i}`} type={c} />)}
                      </div>
                    </div>
                    {attack.damage && <span className="font-black text-slate-900 dark:text-white">{attack.damage}</span>}
                  </div>
                  {attack.text && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{attack.text}</p>}
                </div>
              ))}
            </Section>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <InfoBlock title="Fraquezas">
                {card.weaknesses.map((w) => (
                  <div key={w.type} className="flex items-center gap-1.5">
                    <TypeBadge type={w.type} /> <span className="text-sm font-semibold">{w.value}</span>
                  </div>
                ))}
              </InfoBlock>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <InfoBlock title="Resistências">
                {card.resistances.map((r) => (
                  <div key={r.type} className="flex items-center gap-1.5">
                    <TypeBadge type={r.type} /> <span className="text-sm font-semibold">{r.value}</span>
                  </div>
                ))}
              </InfoBlock>
            )}
            {card.retreatCost && (
              <InfoBlock title="Custo de recuo">
                <div className="flex gap-1">
                  {card.retreatCost.length > 0
                    ? card.retreatCost.map((c, i) => <TypeBadge key={i} type={c} />)
                    : <span className="text-sm text-slate-400">Nenhum</span>}
                </div>
              </InfoBlock>
            )}
          </div>

          <Section title="Detalhes">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-100 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
              <DetailRow label="Set" value={card.set.name} />
              <DetailRow label="Série" value={card.set.series} />
              <DetailRow label="Número" value={`${card.number}/${card.set.printedTotal}`} />
              <DetailRow label="Artista" value={card.artist ?? '—'} />
              <DetailRow label="Lançamento" value={card.set.releaseDate} />
              <DetailRow label="Preço aprox." value={formatCurrency(price)} />
            </div>
          </Section>

          {card.flavorText && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm italic text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              &ldquo;{card.flavorText}&rdquo;
            </p>
          )}
        </div>
      </div>

      {relatedCards && relatedCards.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Cartas relacionadas</h2>
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
            {relatedCards.map((related) => (
              <div key={related.id} className="w-40 shrink-0">
                <PokemonCardTile card={related} />
              </div>
            ))}
          </div>
        </div>
      )}

      <AddToDeckModal open={deckModalOpen} onClose={() => setDeckModalOpen(false)} card={card} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Heart
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[11px] font-semibold transition ${
        active
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300'
          : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? 'fill-current' : ''}`} />
      {label}
    </button>
  )
}

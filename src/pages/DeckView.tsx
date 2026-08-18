import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FileText,
  Layers,
  MessageSquare,
  Pencil,
  Share2,
  Table,
  Trash2,
} from 'lucide-react'
import { useDeckStore } from '@/store/useDeckStore'
import { useSharedDeckStore } from '@/store/useSharedDeckStore'
import { useUserStore } from '@/store/useUserStore'
import { useDeckRecommendations } from '@/hooks/useDeckRecommendations'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeckAnalysisPanel } from '@/components/decks/DeckAnalysisPanel'
import { PokemonCardTile } from '@/components/cards/PokemonCardTile'
import { downloadTextFile, exportDeckAsCsv, exportDeckAsJson, exportDeckAsTxt } from '@/lib/exportImport'
import { toast } from '@/store/useToastStore'
import { formatDate } from '@/lib/format'
import { DropdownMenu } from '@/components/ui/DropdownMenu'

export function DeckView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deck = useDeckStore((s) => (id ? s.decks[id] : undefined))
  const registerOpen = useDeckStore((s) => s.registerOpen)
  const deleteDeck = useDeckStore((s) => s.deleteDeck)
  const addComment = useDeckStore((s) => s.addComment)
  const removeComment = useDeckStore((s) => s.removeComment)
  const shareDeck = useSharedDeckStore((s) => s.shareDeck)
  const userName = useUserStore((s) => s.profile.name)
  const { data: recommendations } = useDeckRecommendations(deck)

  const [tab, setTab] = useState<'cards' | 'analysis' | 'notes'>('cards')
  const [comment, setComment] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (id) registerOpen(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const analysis = useMemo(() => (deck ? analyzeDeck(deck.cards, deck.format) : null), [deck])

  if (!deck || !analysis) {
    return (
      <EmptyState
        icon={Layers}
        title="Deck não encontrado"
        description="Este deck pode ter sido removido."
        action={<Button onClick={() => navigate('/decks')}>Voltar para meus decks</Button>}
      />
    )
  }

  const grouped = {
    Pokémon: deck.cards.filter((e) => e.card.supertype === 'Pokémon'),
    Trainer: deck.cards.filter((e) => e.card.supertype === 'Trainer'),
    Energy: deck.cards.filter((e) => e.card.supertype === 'Energy'),
  }

  const handleShare = () => {
    const shareId = shareDeck(deck, userName)
    const url = `${window.location.origin}/decks/shared/${shareId}`
    navigator.clipboard?.writeText(url).catch(() => {})
    toast.success('Link de compartilhamento copiado!', url)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={() => navigate('/decks')}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Meus decks
      </button>

      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6 text-white shadow-glow sm:p-8"
        style={{ background: `linear-gradient(135deg, ${deck.color}, ${deck.color}99)` }}
      >
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">{deck.format}</p>
            <h1 className="mt-1 text-3xl font-black text-white">{deck.name}</h1>
            {deck.description && <p className="mt-2 max-w-lg text-sm text-white/85">{deck.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {deck.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(`/decks/${deck.id}/edit`)}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
            <DropdownMenu
              align="right"
              trigger={
                <Button variant="secondary">
                  <Download className="h-4 w-4" /> Exportar
                </Button>
              }
              items={[
                {
                  label: 'Exportar JSON',
                  icon: <FileText className="h-4 w-4" />,
                  onClick: () => downloadTextFile(`${deck.name}.json`, exportDeckAsJson(deck), 'application/json'),
                },
                {
                  label: 'Exportar TXT',
                  icon: <FileText className="h-4 w-4" />,
                  onClick: () => downloadTextFile(`${deck.name}.txt`, exportDeckAsTxt(deck), 'text/plain'),
                },
                {
                  label: 'Exportar CSV',
                  icon: <Table className="h-4 w-4" />,
                  onClick: () => downloadTextFile(`${deck.name}.csv`, exportDeckAsCsv(deck), 'text/csv'),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Tabs
          items={[
            { id: 'cards', label: 'Cartas', count: analysis.categoryCounts.total },
            { id: 'analysis', label: 'Análise', icon: undefined },
            { id: 'notes', label: 'Notas', count: deck.comments.length },
          ]}
          activeId={tab}
          onChange={(t) => setTab(t as typeof tab)}
        />
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Criado em {formatDate(deck.createdAt)}</span>
          <span>·</span>
          <span>Aberto {deck.timesOpened}x</span>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 font-semibold text-ember-500 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
        </div>
      </div>

      {tab === 'cards' && (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([label, entries]) =>
            entries.length === 0 ? null : (
              <div key={label}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  {label === 'Pokémon' ? 'Pokémon' : label === 'Trainer' ? 'Treinadores' : 'Energias'}
                  <Badge tone="slate">{entries.reduce((sum, e) => sum + e.quantity, 0)}</Badge>
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {entries.map((entry) => (
                    <div key={entry.card.id} className="relative">
                      <PokemonCardTile card={entry.card} />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white shadow-lg dark:bg-white dark:text-slate-900">
                        {entry.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          {recommendations && recommendations.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Talvez você goste destas cartas</h2>
              <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-3">
                {recommendations.map((card) => (
                  <div key={card.id} className="w-36 shrink-0">
                    <PokemonCardTile card={card} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'analysis' && <DeckAnalysisPanel analysis={analysis} />}

      {tab === 'notes' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Textarea
              placeholder="Adicione uma nota pessoal sobre este deck..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              className="mt-3"
              onClick={() => {
                if (!comment.trim()) return
                addComment(deck.id, comment)
                setComment('')
              }}
            >
              <MessageSquare className="h-4 w-4" /> Salvar nota
            </Button>
          </div>
          {deck.comments.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Nenhuma nota ainda" description="Registre estratégias, matchups ou lembretes sobre este deck." />
          ) : (
            <div className="flex flex-col gap-3">
              {[...deck.comments].reverse().map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{c.text}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(c.createdAt)}</p>
                  </div>
                  <button onClick={() => removeComment(deck.id, c.id)} className="text-slate-300 hover:text-ember-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir este deck?"
        description={`Tem certeza que deseja excluir "${deck.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir deck"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteDeck(deck.id)
          toast.success('Deck excluído.', deck.name)
          navigate('/decks')
        }}
      />
    </div>
  )
}

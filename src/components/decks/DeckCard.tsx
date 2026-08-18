import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  Copy,
  Download,
  Eye,
  Heart,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import type { Deck } from '@/types/deck'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeckStore } from '@/store/useDeckStore'
import { useSharedDeckStore } from '@/store/useSharedDeckStore'
import { useUserStore } from '@/store/useUserStore'
import { formatRelativeTime, pluralize } from '@/lib/format'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { toast } from '@/store/useToastStore'
import { exportDeckAsJson, downloadTextFile } from '@/lib/exportImport'
import { cn } from '@/lib/cn'

interface DeckCardProps {
  deck: Deck
}

export function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteDeck = useDeckStore((s) => s.deleteDeck)
  const duplicateDeck = useDeckStore((s) => s.duplicateDeck)
  const toggleFavoriteDeck = useDeckStore((s) => s.toggleFavoriteDeck)
  const toggleArchiveDeck = useDeckStore((s) => s.toggleArchiveDeck)
  const shareDeck = useSharedDeckStore((s) => s.shareDeck)
  const userName = useUserStore((s) => s.profile.name)

  const totalCards = deck.cards.reduce((sum, e) => sum + e.quantity, 0)
  const analysis = analyzeDeck(deck.cards, deck.format)
  const types = [...new Set(deck.cards.flatMap((e) => e.card.types ?? []))].slice(0, 3)

  const handleShare = () => {
    const id = shareDeck(deck, userName)
    const url = `${window.location.origin}/decks/shared/${id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    toast.success('Link de compartilhamento copiado!', url)
  }

  const handleExport = () => {
    downloadTextFile(`${deck.name}.json`, exportDeckAsJson(deck), 'application/json')
    toast.success('Deck exportado!', `${deck.name}.json`)
  }

  return (
    <>
      <Link
        to={`/decks/${deck.id}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          className="relative flex h-28 items-end justify-between overflow-hidden p-4"
          style={{
            background: `linear-gradient(135deg, ${deck.color}dd, ${deck.color}88)`,
          }}
        >
          {deck.coverImage && (
            <img
              src={deck.coverImage}
              alt=""
              className="absolute -right-4 -top-4 h-32 w-32 rotate-12 object-contain opacity-30"
            />
          )}
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{deck.format}</p>
            <h3 className="line-clamp-1 text-lg font-black text-white">{deck.name}</h3>
          </div>
          <div className="relative flex items-center gap-1">
            {deck.favorite && <Heart className="h-4 w-4 fill-white text-white" />}
            <DropdownMenu
              trigger={
                <button className="rounded-full bg-white/20 p-1.5 text-white backdrop-blur transition hover:bg-white/30">
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={[
                { label: 'Visualizar', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/decks/${deck.id}`) },
                { label: 'Editar', icon: <Pencil className="h-4 w-4" />, onClick: () => navigate(`/decks/${deck.id}/edit`) },
                {
                  label: deck.favorite ? 'Remover favorito' : 'Favoritar',
                  icon: <Heart className="h-4 w-4" />,
                  onClick: () => toggleFavoriteDeck(deck.id),
                },
                { label: 'Duplicar', icon: <Copy className="h-4 w-4" />, onClick: () => {
                  duplicateDeck(deck.id)
                  toast.success('Deck duplicado!', deck.name)
                } },
                { label: 'Compartilhar', icon: <Share2 className="h-4 w-4" />, onClick: handleShare },
                { label: 'Exportar JSON', icon: <Download className="h-4 w-4" />, onClick: handleExport },
                {
                  label: deck.archived ? 'Desarquivar' : 'Arquivar',
                  icon: deck.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
                  onClick: () => toggleArchiveDeck(deck.id),
                },
                { label: 'Excluir', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => setConfirmDelete(true) },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">
            {deck.description || 'Sem descrição.'}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <Badge key={t} tone="brand">
                {t}
              </Badge>
            ))}
            {deck.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} tone="slate">
                #{tag}
              </Badge>
            ))}
            {deck.archived && <Badge tone="amber">Arquivado</Badge>}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
            <span>
              {totalCards} {pluralize(totalCards, 'carta', 'cartas')}
            </span>
            <span>Atualizado {formatRelativeTime(deck.updatedAt)}</span>
            <span
              className={cn(
                'font-bold',
                analysis.score >= 70 ? 'text-leaf-600 dark:text-leaf-400' : 'text-slate-500',
              )}
            >
              Score {analysis.score}
            </span>
          </div>
        </div>
      </Link>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir este deck?"
        description={`Tem certeza que deseja excluir "${deck.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir deck"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteDeck(deck.id)
          setConfirmDelete(false)
          toast.success('Deck excluído.', deck.name)
        }}
      />
    </>
  )
}

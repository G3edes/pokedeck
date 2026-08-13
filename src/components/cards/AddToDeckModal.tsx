import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDeckStore } from '@/store/useDeckStore'
import type { PokemonCard } from '@/types/pokemon'
import { toast } from '@/store/useToastStore'

interface AddToDeckModalProps {
  open: boolean
  onClose: () => void
  card: PokemonCard | null
}

export function AddToDeckModal({ open, onClose, card }: AddToDeckModalProps) {
  const navigate = useNavigate()
  const decksMap = useDeckStore((s) => s.decks)
  const decks = useMemo(() => Object.values(decksMap).filter((d) => !d.archived), [decksMap])
  const addCardToDeck = useDeckStore((s) => s.addCardToDeck)

  if (!card) return null

  const handleAdd = (deckId: string, deckName: string) => {
    const result = addCardToDeck(deckId, card)
    if (result === 'added') {
      toast.success('Carta adicionada ao deck!', `${card.name} → ${deckName}`)
    } else {
      toast.error('Não foi possível adicionar a carta.', 'Limite de cópias atingido para este formato.')
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar ao deck" description={card.name}>
      {decks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Você ainda não possui nenhum deck"
          description="Crie seu primeiro deck para começar a montar sua estratégia."
          action={
            <Button onClick={() => navigate('/decks/new')}>
              <Plus className="h-4 w-4" /> Criar meu primeiro deck
            </Button>
          }
        />
      ) : (
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto scrollbar-thin">
          {decks.map((deck) => {
            const count = deck.cards.reduce((sum, e) => sum + e.quantity, 0)
            return (
              <button
                key={deck.id}
                onClick={() => handleAdd(deck.id, deck.name)}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:bg-brand-500/5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{deck.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {count} cartas · {deck.format}
                  </p>
                </div>
                <Plus className="h-4 w-4 text-brand-500" />
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

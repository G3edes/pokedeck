import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DECK_COLORS, DECK_FORMATS, type DeckFormat } from '@/types/deck'
import { FORMAT_RULES } from '@/lib/deckRules'
import { useDeckStore } from '@/store/useDeckStore'
import { toast } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

export function DeckNew() {
  const navigate = useNavigate()
  const createDeck = useDeckStore((s) => s.createDeck)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState<DeckFormat>('Standard')
  const [color, setColor] = useState<string>(DECK_COLORS[0].value)
  const [coverImage, setCoverImage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')

  function addTag() {
    const value = tagInput.trim().replace(/^#/, '')
    if (value && !tags.includes(value)) setTags([...tags, value])
    setTagInput('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Dê um nome ao seu deck para continuar.')
      return
    }
    const deck = createDeck({
      name: name.trim(),
      description: description.trim(),
      format,
      color,
      tags,
      coverImage: coverImage.trim() || undefined,
    })
    toast.success('Deck criado!', 'Agora adicione suas cartas.')
    navigate(`/decks/${deck.id}/edit`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Criar novo deck</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Defina a identidade do seu deck. Você poderá adicionar as cartas em seguida no Deck Builder.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Input
          label="Nome do deck"
          placeholder="Ex: Fúria Elétrica"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
        />
        <Textarea
          label="Descrição"
          placeholder="Descreva a estratégia do seu deck..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Formato"
          value={format}
          onChange={(e) => setFormat(e.target.value as DeckFormat)}
          hint={FORMAT_RULES[format].description}
        >
          {DECK_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>

        <Input
          label="Imagem de capa (URL, opcional)"
          placeholder="https://images.pokemontcg.io/..."
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Cor principal</p>
          <div className="flex flex-wrap gap-2">
            {DECK_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setColor(c.value)}
                title={c.label}
                className={cn(
                  'h-9 w-9 rounded-full ring-offset-2 transition dark:ring-offset-slate-900',
                  color === c.value && 'ring-2 ring-slate-400',
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Tags</p>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: agressivo, competitivo..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Adicionar
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/decks')}>
            Cancelar
          </Button>
          <Button type="submit">Criar e montar deck</Button>
        </div>
      </form>
    </div>
  )
}

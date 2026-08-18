import { useState } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { DECK_COLORS, DECK_FORMATS, type Deck, type DeckFormat } from '@/types/deck'
import { cn } from '@/lib/cn'

interface DeckSettingsModalProps {
  open: boolean
  onClose: () => void
  deck: Deck
  onSave: (changes: Partial<Deck>) => void
}

export function DeckSettingsModal({ open, onClose, deck, onSave }: DeckSettingsModalProps) {
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description)
  const [format, setFormat] = useState<DeckFormat>(deck.format)
  const [color, setColor] = useState(deck.color)
  const [coverImage, setCoverImage] = useState(deck.coverImage ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(deck.tags)

  function addTag() {
    const value = tagInput.trim().replace(/^#/, '')
    if (value && !tags.includes(value)) setTags([...tags, value])
    setTagInput('')
  }

  function handleSave() {
    onSave({ name: name.trim() || deck.name, description, format, color, coverImage: coverImage.trim() || undefined, tags })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Configurações do deck" size="lg">
      <div className="flex flex-col gap-4">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Select label="Formato" value={format} onChange={(e) => setFormat(e.target.value as DeckFormat)}>
          {DECK_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        <Input label="Imagem de capa (URL)" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Cor principal</p>
          <div className="flex flex-wrap gap-2">
            {DECK_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.value)}
                className={cn('h-8 w-8 rounded-full ring-offset-2 dark:ring-offset-slate-900', color === c.value && 'ring-2 ring-slate-400')}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Tags</p>
          <div className="flex gap-2">
            <Input
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
                <span key={tag} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  #{tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </div>
      </div>
    </Modal>
  )
}

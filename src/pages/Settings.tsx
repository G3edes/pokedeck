import { useState, type ReactNode } from 'react'
import {
  Download,
  Info,
  Keyboard,
  Languages,
  Palette,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useUserStore, DEFAULT_AVATARS } from '@/store/useUserStore'
import { useDeckStore } from '@/store/useDeckStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { downloadTextFile } from '@/lib/exportImport'
import { toast } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

const SHORTCUTS = [
  { keys: 'Ctrl + K', description: 'Abrir pesquisa rápida' },
  { keys: 'N', description: 'Criar novo deck' },
  { keys: 'F', description: 'Ir para favoritos' },
  { keys: 'D', description: 'Ir para meus decks' },
  { keys: 'Esc', description: 'Fechar modal ou drawer' },
]

const STORAGE_KEYS = [
  'pokedeck-theme',
  'pokedeck-favorites',
  'pokedeck-collection',
  'pokedeck-wishlist',
  'pokedeck-decks',
  'pokedeck-history',
  'pokedeck-user',
  'pokedeck-shared-decks',
  'pokedeck-compare',
]

export function Settings() {
  const profile = useUserStore((s) => s.profile)
  const updateProfile = useUserStore((s) => s.updateProfile)
  const deckCount = useDeckStore((s) => Object.keys(s.decks).length)
  const favoriteCount = useFavoritesStore((s) => Object.keys(s.entries).length)
  const collectionCount = useCollectionStore((s) => Object.keys(s.entries).length)
  const wishlistCount = useWishlistStore((s) => Object.keys(s.entries).length)

  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleSaveProfile() {
    updateProfile({ name: name.trim() || profile.name, bio })
    toast.success('Perfil atualizado!')
  }

  function handleExportData() {
    const payload: Record<string, unknown> = {}
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key)
      if (value) payload[key] = JSON.parse(value)
    }
    downloadTextFile('pokedeck-dados.json', JSON.stringify(payload, null, 2), 'application/json')
    toast.success('Dados exportados!', 'pokedeck-dados.json')
  }

  function handleImportData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result)) as Record<string, unknown>
          for (const key of STORAGE_KEYS) {
            if (parsed[key]) localStorage.setItem(key, JSON.stringify(parsed[key]))
          }
          toast.success('Dados importados! Recarregando...')
          setTimeout(() => window.location.reload(), 1200)
        } catch {
          toast.error('Arquivo inválido.', 'Verifique se é um backup gerado pelo PokéDeck.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function handleClearData() {
    for (const key of STORAGE_KEYS) localStorage.removeItem(key)
    toast.success('Dados locais apagados.', 'Recarregando a aplicação...')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seu perfil, preferências e dados locais.</p>
      </div>

      <SettingsSection icon={User} title="Perfil">
        <div className="flex flex-wrap gap-2">
          {DEFAULT_AVATARS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => updateProfile({ avatar })}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl border-2 bg-slate-50 p-1.5 dark:bg-slate-800',
                profile.avatar === avatar ? 'border-brand-500' : 'border-transparent',
              )}
            >
              <img src={avatar} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <MiniStat label="Decks" value={deckCount} />
          <MiniStat label="Favoritos" value={favoriteCount} />
          <MiniStat label="Coleção" value={collectionCount} />
          <MiniStat label="Wishlist" value={wishlistCount} />
        </div>
        <Button onClick={handleSaveProfile} className="self-start">
          Salvar perfil
        </Button>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Aparência">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tema da interface</p>
          <ThemeToggle />
        </div>
      </SettingsSection>

      <SettingsSection icon={Languages} title="Idioma e preferências">
        <Select label="Idioma" value={profile.language} onChange={(e) => updateProfile({ language: e.target.value as 'pt-BR' | 'en-US' })}>
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
        </Select>
        <p className="text-xs text-slate-400">A tradução completa da interface está no roadmap do projeto.</p>
      </SettingsSection>

      <SettingsSection icon={Keyboard} title="Atalhos de teclado">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">{shortcut.description}</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={Download} title="Dados locais">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todos os seus dados (decks, coleção, favoritos, wishlist) são salvos apenas no seu navegador.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4" /> Exportar meus dados
          </Button>
          <Button variant="outline" onClick={handleImportData}>
            <Upload className="h-4 w-4" /> Importar meus dados
          </Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" /> Limpar dados locais
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection icon={Info} title="Sobre o projeto">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          PokéDeck é uma plataforma para explorar cartas do Pokémon TCG, montar decks e gerenciar sua coleção pessoal.
          Todos os dados de cartas são fornecidos pela Pokémon TCG API. Este projeto não é afiliado à The Pokémon
          Company, Nintendo, Game Freak ou Creatures Inc.
        </p>
      </SettingsSection>

      <ConfirmDialog
        open={confirmClear}
        title="Limpar todos os dados locais?"
        description="Isso removerá permanentemente seus decks, coleção, favoritos e preferências salvas neste navegador."
        confirmLabel="Limpar tudo"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          handleClearData()
          setConfirmClear(false)
        }}
      />
    </div>
  )
}

function SettingsSection({ icon: Icon, title, children }: { icon: typeof User; title: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-500" />
        <h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
      <p className="font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  )
}

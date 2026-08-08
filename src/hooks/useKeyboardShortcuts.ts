import { useEffect } from 'react'

interface ShortcutMap {
  [combo: string]: (event: KeyboardEvent) => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || target.isContentEditable
}

/**
 * Registers global keyboard shortcuts. Combos support `ctrl+k` style modifiers
 * or a bare key like `n`. Bare-key shortcuts are ignored while typing in a field.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, deps: unknown[] = []) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      const comboWithModifier = `${event.ctrlKey || event.metaKey ? 'ctrl+' : ''}${key}`

      for (const [combo, handler] of Object.entries(shortcuts)) {
        const normalized = combo.toLowerCase()
        const needsModifier = normalized.includes('ctrl+')

        if (needsModifier) {
          if (comboWithModifier === normalized) {
            event.preventDefault()
            handler(event)
            return
          }
          continue
        }

        if (normalized === key && !isTypingTarget(event.target)) {
          event.preventDefault()
          handler(event)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

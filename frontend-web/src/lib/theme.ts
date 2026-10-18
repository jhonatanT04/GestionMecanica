import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mecanicasaas.theme'
const listeners = new Set<() => void>()

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let current: Theme = readStored() ?? systemTheme()

function apply() {
  document.documentElement.dataset.theme = current
}

/** Se llama una vez desde main.tsx, antes del primer render. */
export function initTheme() {
  apply()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (readStored()) return
    current = systemTheme()
    apply()
    listeners.forEach((l) => l())
  })
}

export function toggleTheme() {
  current = current === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(STORAGE_KEY, current)
  } catch {
    // Sin storage: el cambio vale solo para esta sesión.
  }
  apply()
  listeners.forEach((l) => l())
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}

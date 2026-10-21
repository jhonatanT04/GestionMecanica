import type { Usuario } from '../types'

const TOKEN_KEY = 'mecanicasaas.token'
const USUARIO_KEY = 'mecanicasaas.usuario'

export interface Session {
  token: string
  usuario: Usuario
}

type Listener = (session: Session | null) => void

const listeners = new Set<Listener>()

/**
 * Sesiones guardadas antes del cambio de roles traen DUENO/RECEPCIONISTA.
 * Se traducen para no forzar un nuevo login (el backend hace lo mismo con el token).
 */
function rolActual(rol: string): Usuario['rol'] {
  if (rol === 'DUENO') return 'ADMIN'
  if (rol === 'RECEPCIONISTA') return 'CAJA'
  return rol as Usuario['rol']
}

function readSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const usuarioRaw = localStorage.getItem(USUARIO_KEY)
  if (!token || !usuarioRaw) return null
  try {
    const usuario = JSON.parse(usuarioRaw) as Usuario
    return { token, usuario: { ...usuario, rol: rolActual(usuario.rol) } }
  } catch {
    return null
  }
}

let current: Session | null = readSession()

function notify() {
  for (const listener of listeners) listener(current)
}

export function getSession(): Session | null {
  return current
}

export function setSession(session: Session): void {
  current = session
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(session.usuario))
  notify()
}

export function clearSession(): void {
  if (current === null) return
  current = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
  notify()
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

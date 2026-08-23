import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { RolUsuario } from '../types'

// Backstop, no el mecanismo principal: el sidebar ya oculta los links que el
// rol actual no puede usar, pero esto protege la navegación directa por URL.
export function RequireRole({ roles }: { roles: RolUsuario[] }) {
  const { session } = useAuth()

  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes(session.usuario.rol)) return <Navigate to="/" replace />

  return <Outlet />
}

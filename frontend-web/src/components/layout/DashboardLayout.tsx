import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ROL_LABELS } from '../../lib/labels'
import type { RolUsuario } from '../../types'

const NAV_ITEMS: { to: string; label: string; end?: boolean; roles?: RolUsuario[] }[] = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/ordenes', label: 'Órdenes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/inventario', label: 'Inventario' },
  { to: '/empleados', label: 'Empleados', roles: ['DUENO'] },
  { to: '/reportes', label: 'Reportes', roles: ['DUENO'] },
]

export function DashboardLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (session && item.roles.includes(session.usuario.rol)))

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <BrandMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">MecanicaSaaS</p>
            <p className="text-xs text-slate-400">Panel de gestión</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-50 text-accent-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 p-3">
          {session && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
                {session.usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{session.usuario.nombre}</p>
                <p className="truncate text-xs text-slate-400">{ROL_LABELS[session.usuario.rol]}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-600">
      <div className="h-3.5 w-1 rotate-45 rounded-full bg-white" />
      <div className="absolute h-3.5 w-1 -rotate-45 rounded-full bg-white" />
    </div>
  )
}

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
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-48 shrink-0 flex-col border-r border-slate-200">
        <div className="px-5 py-6">
          <p className="text-sm font-semibold tracking-tight text-slate-900">MecanicaSaaS</p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  isActive
                    ? 'border-accent-600 font-medium text-accent-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 px-5 py-4">
          {session && (
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-slate-900">{session.usuario.nombre}</p>
              <p className="truncate text-xs text-slate-400">{ROL_LABELS[session.usuario.rol]}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-400 transition-colors hover:text-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-10 py-10">
        <Outlet />
      </main>
    </div>
  )
}

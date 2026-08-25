import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-lg font-semibold text-gray-900">MecanicaSaaS</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-200 p-3">
          <p className="truncate px-3 text-sm font-medium text-gray-900">{session?.usuario.nombre}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

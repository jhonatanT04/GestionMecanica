import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/ordenes', label: 'Órdenes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/inventario', label: 'Inventario' },
  { to: '/empleados', label: 'Empleados' },
]

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-lg font-semibold text-gray-900">MecanicaSaaS</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
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
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

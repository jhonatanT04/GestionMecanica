import { useState, type ComponentType } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Car,
  GearSix,
  ChartBar,
  House,
  IdentificationBadge,
  List,
  Moon,
  Package,
  Receipt,
  SignOut,
  Sun,
  Users,
  Wrench,
  X,
  type IconProps,
} from '@phosphor-icons/react'
import { useAuth } from '../../auth/useAuth'
import { ROL_LABELS } from '../../lib/labels'
import { toggleTheme, useTheme } from '../../lib/theme'
import type { RolUsuario } from '../../types'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<IconProps>
  end?: boolean
  roles?: RolUsuario[]
}

const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: '/', label: 'Inicio', icon: House, end: true },
      { to: '/ordenes', label: 'Órdenes', icon: Wrench },
      { to: '/facturacion', label: 'Facturación', icon: Receipt, roles: ['ADMIN', 'CAJA'] },
      { to: '/clientes', label: 'Clientes', icon: Users },
      { to: '/inventario', label: 'Inventario', icon: Package, roles: ['ADMIN', 'CAJA'] },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/empleados', label: 'Empleados', icon: IdentificationBadge, roles: ['ADMIN'] },
      { to: '/reportes', label: 'Reportes', icon: ChartBar, roles: ['ADMIN'] },
      { to: '/marcas', label: 'Marcas', icon: Car, roles: ['ADMIN'] },
      { to: '/configuracion', label: 'Configuración', icon: GearSix, roles: ['ADMIN'] },
    ],
  },
]

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export function DashboardLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [drawerPath, setDrawerPath] = useState<string | null>(null)

  // El drawer móvil se cierra solo al cambiar de ruta.
  const drawerOpen = drawerPath === location.pathname

  const canSee = (item: NavItem) => !item.roles || (session != null && item.roles.includes(session.usuario.rol))
  const sections = NAV_SECTIONS.map((s) => ({ ...s, items: s.items.filter(canSee) })).filter((s) => s.items.length > 0)

  const current = ALL_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const iniciales = session?.usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-[100dvh] bg-page">
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-scrim lg:hidden" onClick={() => setDrawerPath(null)} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100dvh] lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-white">
              <Wrench size={18} weight="bold" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">MecanicaSaaS</span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerPath(null)}
            aria-label="Cerrar menú"
            className="rounded-md p-1 text-sidebar-muted hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          {sections.map((section, i) => (
            <div key={section.title ?? i} className="flex flex-col gap-0.5">
              {section.title && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                      isActive
                        ? 'bg-sidebar-active font-medium text-white'
                        : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={19} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent-500' : ''} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-surface px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerPath(location.pathname)}
            aria-label="Abrir menú"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <List size={20} />
          </button>

          <p className="text-sm text-slate-500">
            <span className="hidden sm:inline">Taller / </span>
            <span className="font-medium text-slate-900">{current?.label ?? 'Inicio'}</span>
          </p>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />

            {session && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm leading-tight font-medium text-slate-900">{session.usuario.nombre}</p>
                  <p className="text-xs leading-tight text-slate-500">{ROL_LABELS[session.usuario.rol]}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700">
                  {iniciales}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="ml-1 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            >
              <SignOut size={20} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

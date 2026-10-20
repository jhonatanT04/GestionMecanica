import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Package,
  Users,
  Warning,
  Wrench,
  type IconProps,
} from '@phosphor-icons/react'
import { useAuth } from '../auth/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { listarClientes } from '../services/clientesService'
import { listarInventario } from '../services/inventarioService'
import { obtenerReportePorMes } from '../services/reportesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { AreaChart, type ChartPoint } from '../components/charts/AreaChart'
import { ESTADO_LABELS, MES_LABELS } from '../lib/labels'
import { ESTADOS_ORDEN, type EstadoOrden, type OrdenDeTrabajo, type ReporteFacturacionMensual } from '../types'

const ESTADOS_ACTIVOS: EstadoOrden[] = ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO']

const CURRENCY = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const CURRENCY_COMPACT = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const PERCENT = new Intl.NumberFormat('es-EC', { style: 'percent', maximumFractionDigits: 1 })
const FECHA = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' })

export function InicioPage() {
  const { session } = useAuth()
  const esDueno = session?.usuario.rol === 'DUENO'

  const ordenes = useAsyncData(listarOrdenes)
  const clientes = useAsyncData(listarClientes)
  const inventario = useAsyncData(listarInventario)

  const ordenesActivas = ordenes.data?.filter((o) => ESTADOS_ACTIVOS.includes(o.estado)) ?? []
  const listas = ordenesActivas.filter((o) => o.estado === 'LISTO')
  const bajoStock = inventario.data?.filter((p) => p.stockActual < p.stockMinimo) ?? []

  const error = ordenes.error ?? clientes.error ?? inventario.error

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Resumen del taller" />

      {error && <ErrorBanner error={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Órdenes activas" value={ordenesActivas.length} loading={ordenes.loading} icon={Wrench} />
        <StatTile label="Listas para entregar" value={listas.length} loading={ordenes.loading} icon={CheckCircle} />
        <StatTile label="Clientes registrados" value={clientes.data?.length ?? 0} loading={clientes.loading} icon={Users} />
        <StatTile
          label="Productos bajo stock mínimo"
          value={bajoStock.length}
          loading={inventario.loading}
          icon={Package}
          footer={
            bajoStock.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <Warning size={14} weight="fill" />
                Requiere reposición
              </span>
            ) : null
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {esDueno && <FacturacionCard />}

          <Card className="px-0 pb-2 lg:px-0">
            <div className="px-5 lg:px-6">
              <CardHeader
                title="Órdenes en curso"
                subtitle={ordenes.loading ? undefined : `${ordenesActivas.length} en el taller ahora`}
                action={<VerTodo to="/ordenes" label="Ver órdenes" />}
              />
            </div>
            <OrdenesEnCurso loading={ordenes.loading} ordenes={ordenesActivas.slice(0, 8)} />
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Órdenes por estado" subtitle="Todas las órdenes registradas" />
            {ordenes.loading ? (
              <BarsSkeleton />
            ) : (
              <OrdenesPorEstado
                counts={ESTADOS_ORDEN.map((estado) => ({
                  estado,
                  total: ordenes.data?.filter((o) => o.estado === estado).length ?? 0,
                }))}
              />
            )}
          </Card>

          <Card>
            <CardHeader title="Bajo stock mínimo" action={<VerTodo to="/inventario" label="Ver inventario" />} />
            {inventario.loading ? (
              <ListSkeleton rows={3} />
            ) : bajoStock.length === 0 ? (
              <EmptyState title="Inventario en orden" description="Ningún producto está por debajo de su mínimo." />
            ) : (
              <ul className="flex flex-col gap-4">
                {bajoStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{p.nombre}</p>
                      <p className="text-xs text-slate-500">{p.sku}</p>
                    </div>
                    <p className="shrink-0 text-sm text-slate-500 tabular-nums">
                      <span className="font-semibold text-red-600">{p.stockActual}</span> / {p.stockMinimo}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  loading,
  icon: Icon,
  footer,
}: {
  label: string
  value: number
  loading: boolean
  icon: ComponentType<IconProps>
  footer?: ReactNode
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700">
          <Icon size={20} />
        </span>
      </div>
      {loading ? (
        <div className="mt-1 h-9 w-16 rounded-md bg-slate-100 motion-safe:animate-pulse" />
      ) : (
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value.toLocaleString('es-EC')}</p>
      )}
      <p className="mt-2 min-h-5 text-xs">{footer}</p>
    </Card>
  )
}

function VerTodo({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-medium whitespace-nowrap text-accent-600 hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
    >
      {label}
      <ArrowRight size={14} />
    </Link>
  )
}

/** Últimos 12 meses (hasta el mes más reciente con datos), sin huecos. */
function serieMensual(data: ReporteFacturacionMensual[]): ChartPoint[] {
  if (data.length === 0) return []
  const byKey = new Map(data.map((r) => [r.anio * 12 + (r.mes - 1), r.totalFacturado]))
  const lastKey = Math.max(...byKey.keys())
  const firstKey = Math.max(Math.min(...byKey.keys()), lastKey - 11)
  const points: ChartPoint[] = []
  for (let k = firstKey; k <= lastKey; k++) {
    const anio = Math.floor(k / 12)
    const mes = k % 12
    points.push({
      label: `${MES_LABELS[mes]} ${anio}`,
      shortLabel: MES_LABELS[mes].slice(0, 3),
      value: byKey.get(k) ?? 0,
    })
  }
  return points
}

function FacturacionCard() {
  const reporte = useAsyncData(() => obtenerReportePorMes())
  const points = reporte.data ? serieMensual(reporte.data) : []
  const total = points.reduce((sum, p) => sum + p.value, 0)
  const ultimo = points.at(-1)
  const previo = points.at(-2)
  const delta = ultimo && previo && previo.value > 0 ? (ultimo.value - previo.value) / previo.value : null

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Facturación mensual</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {points.length > 0 ? `${points[0].label} a ${ultimo!.label}` : 'Últimos 12 meses'}
          </p>
        </div>
        {points.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{CURRENCY.format(total)}</p>
            {delta !== null && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                {delta >= 0 ? (
                  <ArrowUpRight size={14} weight="bold" className="text-accent-600" />
                ) : (
                  <ArrowDownRight size={14} weight="bold" className="text-red-600" />
                )}
                <span className="font-medium text-slate-900">
                  {delta >= 0 ? '+' : ''}
                  {PERCENT.format(delta)}
                </span>
                vs. mes anterior
              </p>
            )}
          </div>
        )}
      </div>

      {reporte.error ? (
        <ErrorBanner error={reporte.error} />
      ) : reporte.loading ? (
        <div className="h-60 rounded-md bg-slate-50 motion-safe:animate-pulse" />
      ) : points.length === 0 ? (
        <EmptyState title="Aún no hay facturas" description="La gráfica aparecerá con la primera factura emitida." />
      ) : (
        <AreaChart
          points={points}
          formatValue={(v) => CURRENCY.format(v)}
          formatTick={(v) => CURRENCY_COMPACT.format(v)}
          ariaLabel={`Facturación mensual, total ${CURRENCY.format(total)}`}
        />
      )}
    </Card>
  )
}

/** Barras horizontales de un solo tono: magnitud por estado, valor en la punta. */
function OrdenesPorEstado({ counts }: { counts: { estado: EstadoOrden; total: number }[] }) {
  const max = Math.max(...counts.map((c) => c.total), 1)
  return (
    <ul className="flex flex-col gap-3.5">
      {counts.map(({ estado, total }) => (
        <li key={estado} className="grid grid-cols-[7.5rem_1fr] items-center gap-3">
          <span className="truncate text-sm text-slate-600">{ESTADO_LABELS[estado]}</span>
          <div className="flex items-center gap-2" title={`${ESTADO_LABELS[estado]}: ${total}`}>
            {total > 0 && (
              <div
                className={`h-3 rounded-r-[4px] ${estado === 'ENTREGADO' ? 'bg-slate-300' : 'bg-accent-500'}`}
                style={{ width: `calc(${(total / max) * 100}% - 2.5rem)`, minWidth: 4 }}
              />
            )}
            <span className="text-sm font-medium text-slate-900 tabular-nums">{total}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function OrdenesEnCurso({
  loading,
  ordenes,
}: {
  loading: boolean
  ordenes: OrdenDeTrabajo[]
}) {
  if (loading) {
    return (
      <div className="px-5 lg:px-6">
        <ListSkeleton rows={4} />
      </div>
    )
  }
  if (ordenes.length === 0) {
    return <EmptyState title="No hay órdenes activas" description="Las nuevas órdenes aparecerán aquí al registrarse." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <th className="px-5 py-2.5 font-medium lg:px-6">Vehículo</th>
            <th className="px-3 py-2.5 font-medium">Cliente</th>
            <th className="px-3 py-2.5 font-medium">Mecánico</th>
            <th className="px-3 py-2.5 font-medium">Ingreso</th>
            <th className="px-5 py-2.5 font-medium lg:px-6">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ordenes.map((orden) => (
            <tr key={orden.id} className="transition-colors hover:bg-slate-50">
              <td className="px-5 py-3 lg:px-6">
                <p className="font-medium text-slate-900">
                  {orden.vehiculo.marca?.nombre} {orden.vehiculo.modelo}
                </p>
                <p className="text-xs text-slate-500">{orden.vehiculo.placa}</p>
              </td>
              <td className="px-3 py-3 text-slate-600">{orden.vehiculo.cliente.nombre}</td>
              <td className="px-3 py-3 text-slate-600">{orden.mecanicoAsignado?.nombre ?? 'Sin asignar'}</td>
              <td className="px-3 py-3 whitespace-nowrap text-slate-600 tabular-nums">
                {FECHA.format(new Date(`${orden.fechaEntrada.slice(0, 10)}T12:00:00`))}
              </td>
              <td className="px-5 py-3 lg:px-6">
                <StatusBadge estado={orden.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-2/5 rounded bg-slate-100 motion-safe:animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-slate-100 motion-safe:animate-pulse" />
          </div>
          <div className="h-5 w-20 rounded-full bg-slate-100 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function BarsSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-label="Cargando">
      {[70, 45, 85, 30, 55].map((w) => (
        <div key={w} className="grid grid-cols-[7.5rem_1fr] items-center gap-3">
          <div className="h-3.5 w-20 rounded bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-3 rounded-r-[4px] bg-slate-100 motion-safe:animate-pulse" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { listarClientes } from '../services/clientesService'
import { listarVehiculos } from '../services/vehiculosService'
import { listarInventario } from '../services/inventarioService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Table'
import type { EstadoOrden } from '../types'

const ESTADOS_ACTIVOS: EstadoOrden[] = ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO']

export function InicioPage() {
  const ordenes = useAsyncData(listarOrdenes)
  const clientes = useAsyncData(listarClientes)
  const vehiculos = useAsyncData(listarVehiculos)
  const inventario = useAsyncData(listarInventario)

  const ordenesActivas = ordenes.data?.filter((o) => ESTADOS_ACTIVOS.includes(o.estado)) ?? []
  const bajoStock = inventario.data?.filter((p) => p.stockActual < p.stockMinimo) ?? []

  const error = ordenes.error ?? clientes.error ?? vehiculos.error ?? inventario.error

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Resumen del taller" />

      {error && <ErrorBanner error={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResumenCard label="Órdenes activas" value={ordenesActivas.length} />
        <ResumenCard label="Clientes registrados" value={clientes.data?.length ?? 0} />
        <ResumenCard label="Vehículos registrados" value={vehiculos.data?.length ?? 0} />
        <ResumenCard label="Productos bajo stock mínimo" value={bajoStock.length} alert={bajoStock.length > 0} />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Órdenes en curso</h2>
          <Link to="/ordenes" className="text-sm font-medium text-accent-600 hover:text-accent-700 hover:underline">
            Ver todas
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {ordenesActivas.map((orden) => (
            <li key={orden.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {orden.vehiculo.marca} {orden.vehiculo.modelo} · <span className="font-mono">{orden.vehiculo.placa}</span>
                </p>
                <p className="truncate text-sm text-slate-500">{orden.problemaReportado}</p>
              </div>
              <StatusBadge estado={orden.estado} />
            </li>
          ))}
          {ordenes.loading && (
            <li className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-slate-400">
              <Spinner />
              Cargando...
            </li>
          )}
          {!ordenes.loading && ordenesActivas.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-400">No hay órdenes activas.</li>
          )}
        </ul>
      </Card>
    </div>
  )
}

function ResumenCard({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-3xl font-semibold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
    </Card>
  )
}

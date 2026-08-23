import { Link } from 'react-router-dom'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { listarClientes } from '../services/clientesService'
import { listarVehiculos } from '../services/vehiculosService'
import { listarInventario } from '../services/inventarioService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
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
      <h1 className="text-2xl font-semibold text-gray-900">Resumen del taller</h1>

      {error && <ErrorBanner error={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResumenCard label="Órdenes activas" value={ordenesActivas.length} />
        <ResumenCard label="Clientes registrados" value={clientes.data?.length ?? 0} />
        <ResumenCard label="Vehículos registrados" value={vehiculos.data?.length ?? 0} />
        <ResumenCard label="Productos bajo stock mínimo" value={bajoStock.length} alert={bajoStock.length > 0} />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Órdenes en curso</h2>
          <Link to="/ordenes" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <ul className="divide-y divide-gray-100">
          {ordenesActivas.map((orden) => (
            <li key={orden.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {orden.vehiculo.marca} {orden.vehiculo.modelo} · {orden.vehiculo.placa}
                </p>
                <p className="text-sm text-gray-500">{orden.problemaReportado}</p>
              </div>
              <StatusBadge estado={orden.estado} />
            </li>
          ))}
          {!ordenes.loading && ordenesActivas.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-gray-500">No hay órdenes activas.</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function ResumenCard({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

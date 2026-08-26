import { useAsyncData } from '../hooks/useAsyncData'
import { listarClientes } from '../services/clientesService'
import { listarVehiculos } from '../services/vehiculosService'
import { listarOrdenes } from '../services/ordenesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Table'

export function ClientesPage() {
  const clientes = useAsyncData(listarClientes)
  const vehiculos = useAsyncData(listarVehiculos)
  const ordenes = useAsyncData(listarOrdenes)

  const error = clientes.error ?? vehiculos.error ?? ordenes.error

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clientes" />

      {error && <ErrorBanner error={error} />}

      {clientes.loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Spinner />
          Cargando...
        </div>
      )}

      {!clientes.loading && clientes.data?.length === 0 && (
        <EmptyState title="Todavía no hay clientes registrados" />
      )}

      <div className="flex flex-col gap-4">
        {clientes.data?.map((cliente) => {
          const vehiculosCliente = vehiculos.data?.filter((v) => v.cliente.id === cliente.id) ?? []
          const vehiculoIds = new Set(vehiculosCliente.map((v) => v.id))
          const ordenesCliente = ordenes.data?.filter((o) => vehiculoIds.has(o.vehiculo.id)) ?? []

          return (
            <Card key={cliente.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">{cliente.nombre}</h2>
                <p className="text-sm text-slate-500">
                  {cliente.telefono ?? '—'} · {cliente.email ?? '—'}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{cliente.direccion ?? '—'}</p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Vehículos</p>
                  <ul className="flex flex-col gap-1">
                    {vehiculosCliente.map((v) => (
                      <li key={v.id} className="text-sm text-slate-700">
                        {v.marca} {v.modelo} ({v.anio}) · <span className="font-mono">{v.placa}</span> ·{' '}
                        <span className="font-mono">{v.kilometrajeActual?.toLocaleString() ?? '—'}</span> km
                      </li>
                    ))}
                    {vehiculosCliente.length === 0 && (
                      <li className="text-sm text-slate-400">Sin vehículos registrados</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Historial de órdenes
                  </p>
                  <ul className="flex flex-col gap-2">
                    {ordenesCliente.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                        <span>
                          <span className="font-mono">{o.fechaEntrada}</span> — {o.problemaReportado}
                        </span>
                        <StatusBadge estado={o.estado} />
                      </li>
                    ))}
                    {ordenesCliente.length === 0 && <li className="text-sm text-slate-400">Sin órdenes registradas</li>}
                  </ul>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

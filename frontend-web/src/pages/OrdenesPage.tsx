import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'

export function OrdenesPage() {
  const ordenes = useAsyncData(listarOrdenes)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Órdenes de trabajo</h1>

      {ordenes.error && <ErrorBanner error={ordenes.error} />}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Vehículo</Th>
              <Th>Cliente</Th>
              <Th>Problema reportado</Th>
              <Th>Mecánico</Th>
              <Th>Entrada</Th>
              <Th>Salida estimada</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {ordenes.data?.map((orden) => (
              <tr key={orden.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {orden.vehiculo.marca} {orden.vehiculo.modelo} · {orden.vehiculo.placa}
                </td>
                <td className="px-4 py-3 text-gray-600">{orden.vehiculo.cliente.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{orden.problemaReportado}</td>
                <td className="px-4 py-3 text-gray-600">{orden.mecanicoAsignado?.nombre ?? 'Sin asignar'}</td>
                <td className="px-4 py-3 text-gray-600">{orden.fechaEntrada}</td>
                <td className="px-4 py-3 text-gray-600">{orden.fechaEstimadaSalida ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge estado={orden.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">{children}</th>
  )
}

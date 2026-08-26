import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Th, TableLoadingRow, TableStatusRow } from '../components/ui/Table'

const COLUMN_COUNT = 7

export function OrdenesPage() {
  const ordenes = useAsyncData(listarOrdenes)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Órdenes de trabajo" />

      {ordenes.error && <ErrorBanner error={ordenes.error} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
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
          <tbody className="divide-y divide-slate-100">
            {ordenes.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!ordenes.loading && ordenes.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay órdenes de trabajo registradas</TableStatusRow>
            )}
            {ordenes.data?.map((orden) => (
              <tr key={orden.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {orden.vehiculo.marca} {orden.vehiculo.modelo} · <span className="font-mono">{orden.vehiculo.placa}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{orden.vehiculo.cliente.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{orden.problemaReportado}</td>
                <td className="px-4 py-3 text-slate-600">{orden.mecanicoAsignado?.nombre ?? 'Sin asignar'}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{orden.fechaEntrada}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{orden.fechaEstimadaSalida ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge estado={orden.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NuevaOrdenModal } from '../components/NuevaOrdenModal'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'

const COLUMN_COUNT = 8

export function OrdenesPage() {
  const ordenes = useAsyncData(listarOrdenes)
  const { session } = useAuth()
  const navigate = useNavigate()
  const [creando, setCreando] = useState(false)
  // En la web solo el mecánico abre órdenes; caja las registra desde la app móvil.
  const puedeCrear = session?.usuario.rol === 'MECANICO'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Órdenes de trabajo"
        action={
          puedeCrear ? (
            <Button type="button" onClick={() => setCreando(true)}>
              + Nueva orden
            </Button>
          ) : undefined
        }
      />

      {ordenes.error && <ErrorBanner error={ordenes.error} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <TableHead>
            <tr>
              <Th>Vehículo</Th>
              <Th>Cliente</Th>
              <Th>Problema reportado</Th>
              <Th>Mecánico</Th>
              <Th>Entrada</Th>
              <Th>Salida estimada</Th>
              <Th>Estado</Th>
              <Th>
                <span className="sr-only">Acciones</span>
              </Th>
            </tr>
          </TableHead>
          <tbody className="divide-y divide-slate-100">
            {ordenes.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!ordenes.loading && ordenes.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay órdenes de trabajo registradas</TableStatusRow>
            )}
            {ordenes.data?.map((orden) => (
              <tr key={orden.id}>
                <td className="px-4 py-4 font-medium text-slate-900">
                  {orden.vehiculo.marca?.nombre} {orden.vehiculo.modelo} · {orden.vehiculo.placa}
                </td>
                <td className="px-4 py-4 text-slate-600">{orden.vehiculo.cliente.nombreCompleto}</td>
                <td className="px-4 py-4 text-slate-600">{orden.problemaReportado}</td>
                <td className="px-4 py-4 text-slate-600">{orden.mecanicoAsignado?.nombre ?? 'Sin asignar'}</td>
                <td className="px-4 py-4 tabular-nums text-slate-600">{orden.fechaEntrada}</td>
                <td className="px-4 py-4 tabular-nums text-slate-600">{orden.fechaEstimadaSalida ?? '—'}</td>
                <td className="px-4 py-4">
                  <StatusBadge estado={orden.estado} />
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/ordenes/${orden.id}`}
                    className="rounded-md text-sm font-medium whitespace-nowrap text-accent-600 hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                  >
                    Items y factura
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {creando && session && (
        <NuevaOrdenModal
          mecanicoId={session.usuario.id}
          onClose={() => setCreando(false)}
          onCreada={(orden) => navigate(`/ordenes/${orden.id}`)}
        />
      )}
    </div>
  )
}

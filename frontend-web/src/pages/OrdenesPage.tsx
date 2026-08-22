import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { listarVehiculos } from '../services/vehiculosService'
import { listarClientes } from '../services/clientesService'
import { listarEmpleados } from '../services/empleadosService'
import { StatusBadge } from '../components/StatusBadge'

export function OrdenesPage() {
  const ordenes = useAsyncData(listarOrdenes)
  const vehiculos = useAsyncData(listarVehiculos)
  const clientes = useAsyncData(listarClientes)
  const empleados = useAsyncData(listarEmpleados)

  const vehiculoPorId = new Map(vehiculos.data?.map((v) => [v.id, v]))
  const clientePorId = new Map(clientes.data?.map((c) => [c.id, c]))
  const empleadoPorId = new Map(empleados.data?.map((e) => [e.id, e]))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Órdenes de trabajo</h1>

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
            {ordenes.data?.map((orden) => {
              const vehiculo = vehiculoPorId.get(orden.vehiculoId)
              const cliente = vehiculo ? clientePorId.get(vehiculo.clienteId) : undefined
              const mecanico = orden.mecanicoId ? empleadoPorId.get(orden.mecanicoId) : undefined
              return (
                <tr key={orden.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} · ${vehiculo.placa}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{orden.problemaReportado}</td>
                  <td className="px-4 py-3 text-gray-600">{mecanico?.nombre ?? 'Sin asignar'}</td>
                  <td className="px-4 py-3 text-gray-600">{orden.fechaEntrada}</td>
                  <td className="px-4 py-3 text-gray-600">{orden.fechaEstimadaSalida ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={orden.estado} />
                  </td>
                </tr>
              )
            })}
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

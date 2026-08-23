import { useAsyncData } from '../hooks/useAsyncData'
import { listarOrdenes } from '../services/ordenesService'
import { ErrorBanner } from '../components/ErrorBanner'
import type { Usuario } from '../types'

interface ResumenMecanico {
  usuario: Usuario
  asignadas: number
  completadas: number
}

export function EmpleadosPage() {
  const ordenes = useAsyncData(listarOrdenes)

  const resumenPorMecanico = new Map<number, ResumenMecanico>()
  for (const orden of ordenes.data ?? []) {
    if (!orden.mecanicoAsignado) continue
    const existente = resumenPorMecanico.get(orden.mecanicoAsignado.id) ?? {
      usuario: orden.mecanicoAsignado,
      asignadas: 0,
      completadas: 0,
    }
    if (orden.estado === 'ENTREGADO') existente.completadas += 1
    else existente.asignadas += 1
    resumenPorMecanico.set(orden.mecanicoAsignado.id, existente)
  }
  const mecanicos = [...resumenPorMecanico.values()]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Empleados</h1>
        <p className="text-sm text-gray-500">
          El backend todavía no expone un listado de usuarios (llega con la fase de autenticación/roles). Esta
          vista muestra los mecánicos que aparecen asignados en órdenes de trabajo reales.
        </p>
      </div>

      {ordenes.error && <ErrorBanner error={ordenes.error} />}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Mecánico</Th>
              <Th>Órdenes asignadas</Th>
              <Th>Órdenes completadas</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!ordenes.loading && mecanicos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Ninguna orden tiene mecánico asignado todavía.
                </td>
              </tr>
            )}
            {mecanicos.map(({ usuario, asignadas, completadas }) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{usuario.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{asignadas}</td>
                <td className="px-4 py-3 text-gray-600">{completadas}</td>
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

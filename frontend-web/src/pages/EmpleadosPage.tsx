import { useAsyncData } from '../hooks/useAsyncData'
import { listarEmpleados } from '../services/empleadosService'
import { listarOrdenes } from '../services/ordenesService'
import type { RolEmpleado } from '../types'

const ROL_LABELS: Record<RolEmpleado, string> = {
  DUENO_ADMIN: 'Dueño / Admin',
  MECANICO: 'Mecánico',
  RECEPCIONISTA: 'Recepcionista',
}

export function EmpleadosPage() {
  const empleados = useAsyncData(listarEmpleados)
  const ordenes = useAsyncData(listarOrdenes)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Empleados</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Nombre</Th>
              <Th>Rol</Th>
              <Th>Contacto</Th>
              <Th>Órdenes asignadas</Th>
              <Th>Órdenes completadas</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {empleados.loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {empleados.data?.map((empleado) => {
              const ordenesEmpleado = ordenes.data?.filter((o) => o.mecanicoId === empleado.id) ?? []
              const completadas = ordenesEmpleado.filter((o) => o.estado === 'ENTREGADO').length
              const asignadas = ordenesEmpleado.length - completadas

              return (
                <tr key={empleado.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{empleado.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{ROL_LABELS[empleado.rol]}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{empleado.telefono}</div>
                    <div>{empleado.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{empleado.rol === 'MECANICO' ? asignadas : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{empleado.rol === 'MECANICO' ? completadas : '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        empleado.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </span>
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

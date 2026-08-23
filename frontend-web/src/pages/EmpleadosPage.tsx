import { useState, type FormEvent, type ReactNode } from 'react'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarUsuarios, crearUsuario } from '../services/usuariosService'
import { ErrorBanner } from '../components/ErrorBanner'
import type { RolUsuario } from '../types'

const ROLES: RolUsuario[] = ['DUENO', 'MECANICO', 'RECEPCIONISTA']

const ROL_LABELS: Record<RolUsuario, string> = {
  DUENO: 'Dueño',
  MECANICO: 'Mecánico',
  RECEPCIONISTA: 'Recepcionista',
}

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

export function EmpleadosPage() {
  const usuarios = useAsyncData(listarUsuarios)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Empleados</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo empleado
        </button>
      </div>

      {usuarios.error && <ErrorBanner error={usuarios.error} />}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {usuarios.data?.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{usuario.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{usuario.email}</td>
                <td className="px-4 py-3 text-gray-600">{ROL_LABELS[usuario.rol]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <NuevoEmpleadoModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            usuarios.refetch()
          }}
        />
      )}
    </div>
  )
}

function NuevoEmpleadoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<RolUsuario>('MECANICO')
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await crearUsuario({ nombre, email, password, rol })
      onCreated()
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Nuevo empleado</h2>

        {error && (
          <div className="mb-4">
            <ErrorBanner error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Contraseña">
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Rol">
            <select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)} className={INPUT_CLASS}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROL_LABELS[r]}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      {children}
    </label>
  )
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">{children}</th>
  )
}

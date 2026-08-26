import { useState, type FormEvent } from 'react'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarUsuarios, crearUsuario } from '../services/usuariosService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import { ROL_LABELS } from '../lib/labels'
import type { RolUsuario } from '../types'

const ROLES: RolUsuario[] = ['DUENO', 'MECANICO', 'RECEPCIONISTA']
const COLUMN_COUNT = 3

export function EmpleadosPage() {
  const usuarios = useAsyncData(listarUsuarios)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empleados"
        action={
          <Button type="button" onClick={() => setShowForm(true)}>
            + Nuevo empleado
          </Button>
        }
      />

      {usuarios.error && <ErrorBanner error={usuarios.error} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <TableHead>
            <tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
            </tr>
          </TableHead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!usuarios.loading && usuarios.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay empleados registrados</TableStatusRow>
            )}
            {usuarios.data?.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-4 font-medium text-slate-900">{usuario.nombre}</td>
                <td className="px-4 py-4 text-slate-600">{usuario.email}</td>
                <td className="px-4 py-4 text-slate-600">{ROL_LABELS[usuario.rol]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

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
    <Modal title="Nuevo empleado" onClose={onClose}>
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

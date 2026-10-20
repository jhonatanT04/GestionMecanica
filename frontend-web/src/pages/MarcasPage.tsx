import { useState, type FormEvent } from 'react'
import { useAsyncData } from '../hooks/useAsyncData'
import { actualizarMarca, crearMarca, eliminarMarca, listarMarcas } from '../services/marcasService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import type { Marca } from '../types'

const COLUMN_COUNT = 3

export function MarcasPage() {
  const marcas = useAsyncData(listarMarcas)
  // undefined = modal cerrado, null = nueva marca, Marca = edición.
  const [editando, setEditando] = useState<Marca | null | undefined>(undefined)
  const [toggleError, setToggleError] = useState<Error | null>(null)

  async function toggleActiva(marca: Marca) {
    setToggleError(null)
    try {
      await actualizarMarca(marca.id, { nombre: marca.nombre, activa: !marca.activa })
      marcas.refetch()
    } catch (err) {
      setToggleError(err as Error)
    }
  }

  function handleSaved() {
    setEditando(undefined)
    marcas.refetch()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marcas de vehículos"
        action={
          <Button type="button" onClick={() => setEditando(null)}>
            + Nueva marca
          </Button>
        }
      />

      {marcas.error && <ErrorBanner error={marcas.error} />}
      {toggleError && <ErrorBanner error={toggleError} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <TableHead>
            <tr>
              <Th>Marca</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </TableHead>
          <tbody className="divide-y divide-slate-100">
            {marcas.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!marcas.loading && marcas.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay marcas registradas</TableStatusRow>
            )}
            {marcas.data?.map((marca) => (
              <tr key={marca.id}>
                <td className={`px-4 py-4 font-medium ${marca.activa ? 'text-slate-900' : 'text-slate-400'}`}>
                  {marca.nombre}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${
                      marca.activa ? 'bg-accent-100 font-semibold text-accent-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {marca.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" onClick={() => setEditando(marca)}>
                      Editar
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => toggleActiva(marca)}>
                      {marca.activa ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editando !== undefined && (
        <MarcaModal marca={editando} onClose={() => setEditando(undefined)} onSaved={handleSaved} />
      )}
    </div>
  )
}

function MarcaModal({
  marca,
  onClose,
  onSaved,
}: {
  marca: Marca | null
  onClose: () => void
  onSaved: () => void
}) {
  const [nombre, setNombre] = useState(marca?.nombre ?? '')
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(action: () => Promise<unknown>) {
    setError(null)
    setLoading(true)
    try {
      await action()
      onSaved()
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    run(() =>
      marca ? actualizarMarca(marca.id, { nombre, activa: marca.activa }) : crearMarca({ nombre, activa: true }),
    )
  }

  return (
    <Modal title={marca ? 'Editar marca' : 'Nueva marca'} onClose={onClose}>
      {error && (
        <div className="mb-4">
          <ErrorBanner error={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre">
          <input
            required
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <div className="mt-2 flex items-center justify-between gap-2">
          {marca ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              disabled={loading}
              onClick={() => run(() => eliminarMarca(marca.id))}
            >
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

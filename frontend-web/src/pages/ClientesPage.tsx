import { useState, type FormEvent } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { useAsyncData } from '../hooks/useAsyncData'
import { actualizarCliente, listarClientes } from '../services/clientesService'
import { listarVehiculos } from '../services/vehiculosService'
import { listarOrdenes } from '../services/ordenesService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { esCedulaValida } from '../lib/cedula'
import type { Cliente } from '../types'

export function ClientesPage() {
  const clientes = useAsyncData(listarClientes)
  const vehiculos = useAsyncData(listarVehiculos)
  const ordenes = useAsyncData(listarOrdenes)
  const [editando, setEditando] = useState<Cliente | null>(null)

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
            <Card key={cliente.id} className="pb-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <h2 className="text-base font-semibold text-slate-900">{cliente.nombreCompleto}</h2>
                  {cliente.cedula ? (
                    <span className="text-sm text-slate-500 tabular-nums">C.I. {cliente.cedula}</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Sin cédula
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditando(cliente)}
                    aria-label={`Editar a ${cliente.nombreCompleto}`}
                    title="Editar cliente"
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                  >
                    <PencilSimple size={16} />
                  </button>
                </div>
                <p className="text-sm text-slate-500">
                  {cliente.telefono ?? '—'} · {cliente.email ?? '—'}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{cliente.direccion ?? '—'}</p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">Vehículos</p>
                  <ul className="flex flex-col gap-1">
                    {vehiculosCliente.map((v) => (
                      <li key={v.id} className="text-sm text-slate-700">
                        {v.marca?.nombre} {v.modelo} ({v.anio}) · {v.placa} ·{' '}
                        <span className="tabular-nums">{v.kilometrajeActual?.toLocaleString() ?? '—'}</span> km
                      </li>
                    ))}
                    {vehiculosCliente.length === 0 && (
                      <li className="text-sm text-slate-400">Sin vehículos registrados</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Historial de órdenes
                  </p>
                  <ul className="flex flex-col gap-2">
                    {ordenesCliente.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                        <span>
                          {o.fechaEntrada} — {o.problemaReportado}
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

      {editando && (
        <EditarClienteModal
          cliente={editando}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null)
            clientes.refetch()
          }}
        />
      )}
    </div>
  )
}

function EditarClienteModal({
  cliente,
  onClose,
  onGuardado,
}: {
  cliente: Cliente
  onClose: () => void
  onGuardado: () => void
}) {
  const [nombres, setNombres] = useState(cliente.nombres)
  const [apellidos, setApellidos] = useState(cliente.apellidos)
  const [cedula, setCedula] = useState(cliente.cedula ?? '')
  const [telefono, setTelefono] = useState(cliente.telefono ?? '')
  const [email, setEmail] = useState(cliente.email ?? '')
  const [direccion, setDireccion] = useState(cliente.direccion ?? '')
  const [error, setError] = useState<Error | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cedulaLimpia = cedula.replace(/[\s-]/g, '')
  const cedulaInvalida = cedulaLimpia.length > 0 && !esCedulaValida(cedulaLimpia)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!esCedulaValida(cedulaLimpia)) return
    setError(null)
    setGuardando(true)
    try {
      await actualizarCliente(cliente.id, {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        cedula: cedulaLimpia,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        direccion: direccion.trim() || null,
      })
      onGuardado()
    } catch (err) {
      setError(err as Error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title="Editar cliente" onClose={onClose}>
      {error && (
        <div className="mb-4">
          <ErrorBanner error={error} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombres">
            <input required value={nombres} onChange={(e) => setNombres(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Apellidos">
            <input required value={apellidos} onChange={(e) => setApellidos(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <Field label="Cédula">
            <input
              required
              inputMode="numeric"
              maxLength={11}
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              aria-invalid={cedulaInvalida}
              aria-describedby="cedula-ayuda"
              className={`${INPUT_CLASS} tabular-nums ${cedulaInvalida ? 'border-red-600 focus:border-red-600' : ''}`}
            />
          </Field>
          <p id="cedula-ayuda" className={`text-xs ${cedulaInvalida ? 'text-red-600' : 'text-slate-500'}`}>
            {cedulaInvalida ? 'La cédula no es válida.' : '10 dígitos, cédula ecuatoriana.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </div>
        <Field label="Dirección">
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} className={INPUT_CLASS} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando || cedulaInvalida}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

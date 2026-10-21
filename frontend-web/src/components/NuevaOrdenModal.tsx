import { useState, type FormEvent } from 'react'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarVehiculos } from '../services/vehiculosService'
import { crearOrden } from '../services/ordenesService'
import { ErrorBanner } from './ErrorBanner'
import { Button } from './ui/Button'
import { Field, INPUT_CLASS } from './ui/Field'
import { Modal } from './ui/Modal'
import type { OrdenDeTrabajo, Vehiculo } from '../types'

/** Fecha local "yyyy-MM-dd" (no UTC), como espera el backend (LocalDate). */
function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function etiquetaVehiculo(v: Vehiculo): string {
  return `${v.placa} · ${[v.marca?.nombre, v.modelo].filter(Boolean).join(' ')} · ${v.cliente.nombreCompleto}`
}

function coincide(v: Vehiculo, texto: string): boolean {
  return [v.placa, v.marca?.nombre, v.modelo, v.cliente.nombreCompleto, v.cliente.cedula]
    .filter(Boolean)
    .some((campo) => campo!.toLowerCase().includes(texto))
}

export function NuevaOrdenModal({
  mecanicoId,
  onClose,
  onCreada,
}: {
  /** El usuario en sesión: por defecto la orden queda asignada a él. */
  mecanicoId: number
  onClose: () => void
  onCreada: (orden: OrdenDeTrabajo) => void
}) {
  const vehiculos = useAsyncData(listarVehiculos)
  const [busqueda, setBusqueda] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')
  const [kilometraje, setKilometraje] = useState('')
  const [problema, setProblema] = useState('')
  const [fechaEntrada, setFechaEntrada] = useState(hoyISO)
  const [salidaEstimada, setSalidaEstimada] = useState('')
  const [asignarme, setAsignarme] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [guardando, setGuardando] = useState(false)

  const texto = busqueda.trim().toLowerCase()
  const opciones = (vehiculos.data ?? []).filter((v) => texto === '' || coincide(v, texto))
  const seleccionado = vehiculos.data?.find((v) => v.id === Number(vehiculoId))

  function elegirVehiculo(id: string) {
    setVehiculoId(id)
    const v = vehiculos.data?.find((x) => x.id === Number(id))
    // Punto de partida: el último kilometraje conocido del vehículo.
    setKilometraje(v?.kilometrajeActual != null ? String(v.kilometrajeActual) : '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const orden = await crearOrden({
        fechaEntrada,
        fechaEstimadaSalida: salidaEstimada || null,
        kilometrajeIngreso: kilometraje === '' ? null : Number(kilometraje),
        problemaReportado: problema.trim(),
        estado: 'RECIBIDO',
        vehiculo: { id: Number(vehiculoId) },
        mecanicoAsignado: asignarme ? { id: mecanicoId } : null,
      })
      onCreada(orden)
    } catch (err) {
      setError(err as Error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title="Nueva orden de trabajo" onClose={onClose}>
      {(error ?? vehiculos.error) && (
        <div className="mb-4">
          <ErrorBanner error={(error ?? vehiculos.error)!} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Field label="Vehículo">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por placa, cliente o cédula"
              className={INPUT_CLASS}
            />
          </Field>
          <select
            required
            aria-label="Vehículo seleccionado"
            value={vehiculoId}
            onChange={(e) => elegirVehiculo(e.target.value)}
            disabled={vehiculos.loading}
            className={INPUT_CLASS}
          >
            <option value="">
              {vehiculos.loading
                ? 'Cargando vehículos...'
                : opciones.length === 0
                  ? 'Ningún vehículo coincide'
                  : `Selecciona un vehículo (${opciones.length})`}
            </option>
            {opciones.map((v) => (
              <option key={v.id} value={v.id}>
                {etiquetaVehiculo(v)}
              </option>
            ))}
          </select>
          {seleccionado && (
            <p className="text-xs text-slate-500">
              Propietario: {seleccionado.cliente.nombreCompleto}
              {seleccionado.cliente.telefono && ` · ${seleccionado.cliente.telefono}`}
            </p>
          )}
        </div>

        <Field label="Problema reportado">
          <textarea
            required
            rows={3}
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            placeholder="Qué nota el cliente en el vehículo"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kilometraje de ingreso">
            <input
              type="number"
              min={0}
              step={1}
              value={kilometraje}
              onChange={(e) => setKilometraje(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Fecha de entrada">
            <input
              required
              type="date"
              max={hoyISO()}
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Salida estimada (opcional)">
            <input
              type="date"
              min={fechaEntrada}
              value={salidaEstimada}
              onChange={(e) => setSalidaEstimada(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={asignarme}
            onChange={(e) => setAsignarme(e.target.checked)}
            className="h-4 w-4 accent-accent-600"
          />
          Asignarme esta orden
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando || vehiculoId === ''}>
            {guardando ? 'Creando...' : 'Crear orden'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

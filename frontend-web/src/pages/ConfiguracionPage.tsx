import { useState, type FormEvent } from 'react'
import { Trash } from '@phosphor-icons/react'
import { useAsyncData } from '../hooks/useAsyncData'
import { eliminarTarifaIva, listarTarifasIva, registrarTarifaIva } from '../services/configuracionService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import type { TarifaIva } from '../types'

const COLUMN_COUNT = 4

/** Fecha local "yyyy-MM-dd" (no UTC), comparable con las LocalDate del backend. */
function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type EstadoTarifa = 'vigente' | 'programada' | 'anterior'

/** El historial llega ordenado de la más reciente a la más antigua. */
function estadoDe(tarifa: TarifaIva, historial: TarifaIva[], hoy: string): EstadoTarifa {
  if (tarifa.vigenteDesde > hoy) return 'programada'
  const vigente = historial.find((t) => t.vigenteDesde <= hoy)
  return vigente?.id === tarifa.id ? 'vigente' : 'anterior'
}

const ESTADO_STYLES: Record<EstadoTarifa, string> = {
  vigente: 'bg-accent-100 text-accent-700',
  programada: 'bg-amber-50 text-amber-700',
  anterior: 'bg-slate-100 text-slate-500',
}

const ESTADO_LABELS: Record<EstadoTarifa, string> = {
  vigente: 'Vigente',
  programada: 'Programada',
  anterior: 'Anterior',
}

export function ConfiguracionPage() {
  const historial = useAsyncData(listarTarifasIva)
  const [porcentaje, setPorcentaje] = useState('')
  const [vigenteDesde, setVigenteDesde] = useState(hoyISO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const hoy = hoyISO()
  const tarifas = historial.data ?? []
  const vigente = tarifas.find((t) => t.vigenteDesde <= hoy)
  const proxima = [...tarifas].reverse().find((t) => t.vigenteDesde > hoy)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await registrarTarifaIva({ porcentaje: Number(porcentaje), vigenteDesde })
      setPorcentaje('')
      setVigenteDesde(hoyISO())
      historial.refetch()
    } catch (err) {
      setError(err as Error)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: number) {
    setError(null)
    try {
      await eliminarTarifaIva(id)
      historial.refetch()
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configuración" />

      {historial.error && <ErrorBanner error={historial.error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <Card>
            <p className="text-sm text-slate-500">IVA vigente</p>
            {historial.loading ? (
              <div className="mt-2 h-10 w-24 rounded-md bg-slate-100 motion-safe:animate-pulse" />
            ) : vigente ? (
              <>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {vigente.porcentaje}%
                </p>
                <p className="mt-1 text-sm text-slate-500">Desde el {vigente.vigenteDesde}</p>
              </>
            ) : (
              <p className="mt-2 text-sm font-medium text-red-600">
                No hay tarifa vigente. No se podrá facturar hasta registrar una.
              </p>
            )}
            {proxima && (
              <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Cambia a {proxima.porcentaje}% el {proxima.vigenteDesde}.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Registrar nueva tarifa"
              subtitle="Úsalo cuando cambie la ley. Puedes programarla con anticipación."
            />
            {error && (
              <div className="mb-4">
                <ErrorBanner error={error} />
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Porcentaje (%)">
                  <input
                    required
                    type="number"
                    min={0}
                    max={99.99}
                    step="0.01"
                    placeholder="Ej. 15"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Rige desde">
                  <input
                    required
                    type="date"
                    min={hoy}
                    value={vigenteDesde}
                    onChange={(e) => setVigenteDesde(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
              <p className="text-xs text-slate-500">
                Las facturas ya emitidas conservan la tarifa con la que se generaron.
              </p>
              <div className="flex justify-end">
                <Button type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Registrar tarifa'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <Card className="overflow-x-auto px-0 lg:col-span-2 lg:px-0">
          <div className="px-5 lg:px-6">
            <CardHeader title="Historial de tarifas de IVA" />
          </div>
          <table className="min-w-full text-sm">
            <TableHead>
              <tr>
                <Th className="pl-5 lg:pl-6">Porcentaje</Th>
                <Th>Rige desde</Th>
                <Th>Estado</Th>
                <Th className="pr-5 lg:pr-6">
                  <span className="sr-only">Acciones</span>
                </Th>
              </tr>
            </TableHead>
            <tbody className="divide-y divide-slate-100">
              {historial.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
              {!historial.loading && tarifas.length === 0 && !historial.error && (
                <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay tarifas registradas.</TableStatusRow>
              )}
              {tarifas.map((t) => {
                const estado = estadoDe(t, tarifas, hoy)
                return (
                  <tr key={t.id}>
                    <td className="py-3 pr-4 pl-5 font-semibold text-slate-900 tabular-nums lg:pl-6">{t.porcentaje}%</td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{t.vigenteDesde}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
                        {ESTADO_LABELS[estado]}
                      </span>
                    </td>
                    <td className="py-3 pr-5 pl-4 text-right lg:pr-6">
                      {estado === 'programada' && (
                        <button
                          type="button"
                          onClick={() => handleEliminar(t.id)}
                          aria-label={`Eliminar tarifa programada del ${t.vigenteDesde}`}
                          title="Eliminar tarifa programada"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

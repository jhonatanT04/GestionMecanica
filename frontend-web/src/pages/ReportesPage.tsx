import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { obtenerReportePorMecanico, obtenerReportePorMes } from '../services/reportesService'
import { ErrorBanner } from '../components/ErrorBanner'
import type { ReporteFiltro } from '../types'

const MES_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

interface ReporteState<T> {
  data: T[] | null
  loading: boolean
  error: Error | null
}

function useReporte<T>(fetcher: (filtro: ReporteFiltro) => Promise<T[]>, filtro: ReporteFiltro): ReporteState<T> {
  const [state, setState] = useState<ReporteState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    fetcher(filtro)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro.desde, filtro.hasta])

  return state
}

export function ReportesPage() {
  const [desdeInput, setDesdeInput] = useState('')
  const [hastaInput, setHastaInput] = useState('')
  const [filtro, setFiltro] = useState<ReporteFiltro>({})

  const porMes = useReporte(obtenerReportePorMes, filtro)
  const porMecanico = useReporte(obtenerReportePorMecanico, filtro)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFiltro({ desde: desdeInput || undefined, hasta: hastaInput || undefined })
  }

  function handleLimpiar() {
    setDesdeInput('')
    setHastaInput('')
    setFiltro({})
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-gray-900">Reportes de facturación</h1>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <Field label="Desde">
          <input
            type="date"
            value={desdeInput}
            onChange={(e) => setDesdeInput(e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            value={hastaInput}
            onChange={(e) => setHastaInput(e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Filtrar
        </button>
        {(filtro.desde || filtro.hasta) && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Limpiar filtro
          </button>
        )}
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Facturación por mes</h2>
        {porMes.error && <ErrorBanner error={porMes.error} />}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Mes</Th>
                <Th>Total facturado</Th>
                <Th>Cantidad de facturas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {porMes.loading && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}
              {!porMes.loading && porMes.data?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Sin datos para el rango seleccionado
                  </td>
                </tr>
              )}
              {porMes.data?.map((fila) => (
                <tr key={`${fila.anio}-${fila.mes}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {MES_LABELS[fila.mes - 1]} {fila.anio}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{CURRENCY_FORMATTER.format(fila.totalFacturado)}</td>
                  <td className="px-4 py-3 text-gray-600">{fila.cantidadFacturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Facturación por mecánico</h2>
        {porMecanico.error && <ErrorBanner error={porMecanico.error} />}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Mecánico</Th>
                <Th>Total facturado</Th>
                <Th>Cantidad de facturas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {porMecanico.loading && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}
              {!porMecanico.loading && porMecanico.data?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Sin datos para el rango seleccionado
                  </td>
                </tr>
              )}
              {porMecanico.data?.map((fila) => (
                <tr key={fila.mecanicoId ?? 'sin-asignar'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{fila.mecanicoNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{CURRENCY_FORMATTER.format(fila.totalFacturado)}</td>
                  <td className="px-4 py-3 text-gray-600">{fila.cantidadFacturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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

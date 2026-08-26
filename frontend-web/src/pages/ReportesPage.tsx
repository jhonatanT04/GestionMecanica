import { useEffect, useState, type FormEvent } from 'react'
import { obtenerReportePorMecanico, obtenerReportePorMes } from '../services/reportesService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Th, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import { MES_LABELS } from '../lib/labels'
import type { ReporteFiltro } from '../types'

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const COLUMN_COUNT = 3

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
      <PageHeader title="Reportes de facturación" />

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Field label="Desde">
              <input
                type="date"
                value={desdeInput}
                onChange={(e) => setDesdeInput(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
          <div className="w-40">
            <Field label="Hasta">
              <input
                type="date"
                value={hastaInput}
                onChange={(e) => setHastaInput(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
          <Button type="submit">Filtrar</Button>
          {(filtro.desde || filtro.hasta) && (
            <Button type="button" variant="ghost" onClick={handleLimpiar}>
              Limpiar filtro
            </Button>
          )}
        </form>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Facturación por mes</h2>
        {porMes.error && <ErrorBanner error={porMes.error} />}
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Mes</Th>
                <Th>Total facturado</Th>
                <Th>Cantidad de facturas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porMes.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
              {!porMes.loading && porMes.data?.length === 0 && (
                <TableStatusRow colSpan={COLUMN_COUNT}>Sin datos para el rango seleccionado</TableStatusRow>
              )}
              {porMes.data?.map((fila) => (
                <tr key={`${fila.anio}-${fila.mes}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {MES_LABELS[fila.mes - 1]} {fila.anio}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{CURRENCY_FORMATTER.format(fila.totalFacturado)}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{fila.cantidadFacturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Facturación por mecánico</h2>
        {porMecanico.error && <ErrorBanner error={porMecanico.error} />}
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Mecánico</Th>
                <Th>Total facturado</Th>
                <Th>Cantidad de facturas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porMecanico.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
              {!porMecanico.loading && porMecanico.data?.length === 0 && (
                <TableStatusRow colSpan={COLUMN_COUNT}>Sin datos para el rango seleccionado</TableStatusRow>
              )}
              {porMecanico.data?.map((fila) => (
                <tr key={fila.mecanicoId ?? 'sin-asignar'} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{fila.mecanicoNombre}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{CURRENCY_FORMATTER.format(fila.totalFacturado)}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{fila.cantidadFacturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}

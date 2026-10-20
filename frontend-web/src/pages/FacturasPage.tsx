import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { useAsyncData } from '../hooks/useAsyncData'
import { listarFacturas, marcarFacturaPagada } from '../services/facturacionService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { INPUT_CLASS } from '../components/ui/Field'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import type { EstadoFactura, Factura } from '../types'

const CURRENCY = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const COLUMN_COUNT = 7

type Filtro = 'TODAS' | EstadoFactura

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'TODAS', label: 'Todas' },
  { valor: 'PENDIENTE', label: 'Pendientes' },
  { valor: 'PAGADA', label: 'Pagadas' },
]

/** "yyyy-MM" del mes en curso, para comparar con fechas LocalDate del backend. */
function mesActual(): string {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

function coincide(factura: Factura, texto: string): boolean {
  const v = factura.orden?.vehiculo
  return [factura.numero, v?.placa, v?.cliente.nombre, v?.marca?.nombre, v?.modelo]
    .filter(Boolean)
    .some((campo) => campo!.toLowerCase().includes(texto))
}

export function FacturasPage() {
  const facturas = useAsyncData(listarFacturas)
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [busqueda, setBusqueda] = useState('')
  const [pagando, setPagando] = useState<number | null>(null)
  const [accionError, setAccionError] = useState<Error | null>(null)

  const todas = [...(facturas.data ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
  const texto = busqueda.trim().toLowerCase()
  const visibles = todas.filter(
    (f) => (filtro === 'TODAS' || f.estado === filtro) && (texto === '' || coincide(f, texto)),
  )

  const mes = mesActual()
  const pendientes = todas.filter((f) => f.estado === 'PENDIENTE')
  const porCobrar = pendientes.reduce((s, f) => s + f.total, 0)
  const cobradoMes = todas
    .filter((f) => f.estado === 'PAGADA' && f.fechaPago?.startsWith(mes))
    .reduce((s, f) => s + f.total, 0)
  const emitidasMes = todas.filter((f) => f.fecha.startsWith(mes)).length

  async function handlePagar(id: number) {
    setAccionError(null)
    setPagando(id)
    try {
      await marcarFacturaPagada(id)
      facturas.refetch()
    } catch (err) {
      setAccionError(err as Error)
    } finally {
      setPagando(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Facturación" />

      {facturas.error && <ErrorBanner error={facturas.error} />}
      {accionError && <ErrorBanner error={accionError} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Resumen
          label="Por cobrar"
          valor={CURRENCY.format(porCobrar)}
          detalle={`${pendientes.length} ${pendientes.length === 1 ? 'factura pendiente' : 'facturas pendientes'}`}
          loading={facturas.loading}
          destacado={pendientes.length > 0}
        />
        <Resumen label="Cobrado este mes" valor={CURRENCY.format(cobradoMes)} loading={facturas.loading} />
        <Resumen label="Emitidas este mes" valor={String(emitidasMes)} loading={facturas.loading} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="radiogroup" aria-label="Estado" className="inline-flex w-fit gap-1 rounded-md bg-slate-100 p-1">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              role="radio"
              aria-checked={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
                filtro === f.valor ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar factura</span>
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Número, placa o cliente"
            className={`${INPUT_CLASS} pl-9`}
          />
        </label>
      </div>

      <Card className="overflow-x-auto px-0 py-0 lg:px-0 lg:py-0">
        <table className="min-w-full text-sm">
          <TableHead>
            <tr>
              <Th className="pl-5 lg:pl-6">Número</Th>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Vehículo</Th>
              <Th className="text-right">Total</Th>
              <Th>Estado</Th>
              <Th className="pr-5 lg:pr-6">
                <span className="sr-only">Acciones</span>
              </Th>
            </tr>
          </TableHead>
          <tbody className="divide-y divide-slate-100">
            {facturas.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!facturas.loading && todas.length === 0 && !facturas.error && (
              <TableStatusRow colSpan={COLUMN_COUNT}>
                Todavía no hay facturas. Se generan desde el detalle de cada orden.
              </TableStatusRow>
            )}
            {!facturas.loading && todas.length > 0 && visibles.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Ninguna factura coincide con el filtro.</TableStatusRow>
            )}
            {visibles.map((f) => {
              const v = f.orden?.vehiculo
              return (
                <tr key={f.id} className="transition-colors hover:bg-slate-50">
                  <td className="py-3 pr-4 pl-5 font-medium whitespace-nowrap text-slate-900 tabular-nums lg:pl-6">
                    {f.numero}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 tabular-nums">{f.fecha}</td>
                  <td className="px-4 py-3 text-slate-600">{v?.cliente.nombre ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {v ? (
                      <>
                        <span className="text-slate-900">
                          {v.marca?.nombre} {v.modelo}
                        </span>
                        <span className="block text-xs text-slate-500">{v.placa}</span>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                    {CURRENCY.format(f.total)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={f.estado} fechaPago={f.fechaPago} />
                  </td>
                  <td className="py-3 pr-5 pl-4 lg:pr-6">
                    <div className="flex items-center justify-end gap-3">
                      {f.estado === 'PENDIENTE' && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5"
                          disabled={pagando === f.id}
                          onClick={() => handlePagar(f.id)}
                        >
                          {pagando === f.id ? 'Registrando...' : 'Marcar pagada'}
                        </Button>
                      )}
                      {f.orden && (
                        <Link
                          to={`/ordenes/${f.orden.id}`}
                          className="rounded-md text-sm font-medium whitespace-nowrap text-accent-600 hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                        >
                          Ver detalle
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Resumen({
  label,
  valor,
  detalle,
  loading,
  destacado,
}: {
  label: string
  valor: string
  detalle?: string
  loading: boolean
  destacado?: boolean
}) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-28 rounded-md bg-slate-100 motion-safe:animate-pulse" />
      ) : (
        <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${destacado ? 'text-amber-700' : 'text-slate-900'}`}>
          {valor}
        </p>
      )}
      {detalle && !loading && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </Card>
  )
}

function EstadoBadge({ estado, fechaPago }: { estado: EstadoFactura; fechaPago: string | null }) {
  if (estado === 'PAGADA') {
    return (
      <span className="inline-flex flex-col">
        <span className="inline-flex w-fit rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
          Pagada
        </span>
        {fechaPago && <span className="mt-0.5 text-xs text-slate-500">{fechaPago}</span>}
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-amber-700">
      Pendiente
    </span>
  )
}

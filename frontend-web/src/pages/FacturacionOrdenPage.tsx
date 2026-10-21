import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { useAuth } from '../auth/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { obtenerOrden } from '../services/ordenesService'
import { obtenerIvaVigente } from '../services/configuracionService'
import { listarInventario } from '../services/inventarioService'
import {
  agregarItem,
  eliminarItem,
  generarFactura,
  listarItems,
  marcarFacturaPagada,
  obtenerFacturaDeOrden,
} from '../services/facturacionService'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'
import type { Factura, ItemOrden, ItemOrdenInput, RolUsuario, TipoItem } from '../types'

const ROLES_QUE_FACTURAN: RolUsuario[] = ['ADMIN', 'CAJA']
const CURRENCY = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const COLUMN_COUNT = 6

const TIPO_LABELS: Record<TipoItem, string> = {
  REPUESTO: 'Repuesto del inventario',
  REPUESTO_EXTERNO: 'Repuesto externo',
  MANO_DE_OBRA: 'Mano de obra',
}

const round2 = (n: number) => Math.round(n * 100) / 100

function subtotalItem(item: ItemOrden): number {
  if (item.tipo === 'MANO_DE_OBRA') return item.costo ?? 0
  return (item.precioUnitario ?? 0) * (item.cantidad ?? 0)
}

/**
 * Igual que FacturaService.generar: los precios de los items ya incluyen IVA, el
 * total es su suma, los subtotales son sin IVA y el IVA es la diferencia.
 * `porcentajeIva` es la tarifa vigente de Configuración (15 = 15%); el backend
 * calcula el valor definitivo al generar.
 */
function totalesPrevios(items: ItemOrden[], porcentajeIva: number) {
  const factor = 1 + porcentajeIva / 100
  const conIvaRepuestos = items.filter((i) => i.tipo !== 'MANO_DE_OBRA').reduce((s, i) => s + subtotalItem(i), 0)
  const conIvaManoObra = items.filter((i) => i.tipo === 'MANO_DE_OBRA').reduce((s, i) => s + subtotalItem(i), 0)
  const total = round2(conIvaRepuestos + conIvaManoObra)
  const repuestos = round2(conIvaRepuestos / factor)
  const manoObra = round2(conIvaManoObra / factor)
  return { repuestos, manoObra, iva: round2(total - repuestos - manoObra), total }
}

export function FacturacionOrdenPage() {
  const { id } = useParams()
  // key: al pasar de una orden a otra se recarga todo desde cero.
  return <FacturacionOrden key={id} ordenId={Number(id)} />
}

function FacturacionOrden({ ordenId }: { ordenId: number }) {
  const { session } = useAuth()
  const puedeFacturar = session != null && ROLES_QUE_FACTURAN.includes(session.usuario.rol)

  const orden = useAsyncData(() => obtenerOrden(ordenId))
  const items = useAsyncData(() => listarItems(ordenId))
  const factura = useAsyncData(() => obtenerFacturaDeOrden(ordenId))
  const tarifaIva = useAsyncData(obtenerIvaVigente)

  const [accionError, setAccionError] = useState<Error | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const facturada = factura.data != null
  const error = orden.error ?? items.error ?? factura.error ?? tarifaIva.error

  async function handleEliminar(itemId: number) {
    setAccionError(null)
    try {
      await eliminarItem(ordenId, itemId)
      items.refetch()
    } catch (err) {
      setAccionError(err as Error)
    }
  }

  async function handleGenerar() {
    setAccionError(null)
    setProcesando(true)
    try {
      await generarFactura(ordenId)
      setConfirmando(false)
      factura.refetch()
    } catch (err) {
      setConfirmando(false)
      setAccionError(err as Error)
    } finally {
      setProcesando(false)
    }
  }

  async function handlePagar(facturaId: number) {
    setAccionError(null)
    setProcesando(true)
    try {
      await marcarFacturaPagada(facturaId)
      factura.refetch()
    } catch (err) {
      setAccionError(err as Error)
    } finally {
      setProcesando(false)
    }
  }

  const v = orden.data?.vehiculo

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/ordenes"
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
        >
          <ArrowLeft size={14} />
          Órdenes
        </Link>
        <PageHeader
          title={`Orden #${ordenId}`}
          action={orden.data ? <StatusBadge estado={orden.data.estado} /> : undefined}
        />
        {v && (
          <p className="text-sm text-slate-500">
            {v.marca?.nombre} {v.modelo} · {v.placa} · {v.cliente.nombreCompleto}
          </p>
        )}
      </div>

      {error && <ErrorBanner error={error} />}
      {accionError && <ErrorBanner error={accionError} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card className="px-0 pb-2 lg:px-0">
            <div className="px-5 lg:px-6">
              <CardHeader
                title="Repuestos y mano de obra"
                subtitle={facturada ? 'La orden está facturada; los items ya no se pueden cambiar.' : undefined}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <TableHead>
                  <tr>
                    <Th className="pl-5 lg:pl-6">Concepto</Th>
                    <Th>Tipo</Th>
                    <Th className="text-right">Cant.</Th>
                    <Th className="text-right">P. unit. con IVA</Th>
                    <Th className="text-right">Importe</Th>
                    <Th className="pr-5 lg:pr-6">
                      <span className="sr-only">Acciones</span>
                    </Th>
                  </tr>
                </TableHead>
                <tbody className="divide-y divide-slate-100">
                  {items.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
                  {!items.loading && items.data?.length === 0 && (
                    <TableStatusRow colSpan={COLUMN_COUNT}>
                      Todavía no hay items. Agrega repuestos o mano de obra abajo.
                    </TableStatusRow>
                  )}
                  {items.data?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 pl-5 lg:pl-6">
                        <p className="font-medium text-slate-900">
                          {item.tipo === 'REPUESTO' ? item.producto?.nombre : item.descripcion}
                        </p>
                        {item.tipo === 'REPUESTO' && item.producto && (
                          <p className="text-xs text-slate-500">{item.producto.sku}</p>
                        )}
                        {item.tipo === 'REPUESTO_EXTERNO' && (
                          <p className="text-xs text-slate-500">
                            {item.proveedor ? `Comprado en ${item.proveedor}` : 'Proveedor no indicado'}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{TIPO_LABELS[item.tipo]}</td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                        {item.tipo === 'MANO_DE_OBRA' ? '-' : (item.cantidad ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                        {item.precioUnitario != null ? CURRENCY.format(item.precioUnitario) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 tabular-nums">
                        {CURRENCY.format(subtotalItem(item))}
                      </td>
                      <td className="py-3 pr-5 pl-2 text-right lg:pr-6">
                        {!facturada && (
                          <button
                            type="button"
                            onClick={() => handleEliminar(item.id)}
                            aria-label="Quitar item"
                            title="Quitar item"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {!facturada && !factura.loading && (
            <AgregarItemCard ordenId={ordenId} onAgregado={items.refetch} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <FacturaCard
            factura={factura.data ?? null}
            loading={factura.loading || items.loading || tarifaIva.loading}
            items={items.data ?? []}
            porcentajeVigente={tarifaIva.data?.porcentaje ?? null}
            puedeFacturar={puedeFacturar}
            procesando={procesando}
            onGenerar={() => setConfirmando(true)}
            onPagar={handlePagar}
          />
        </div>
      </div>

      {confirmando && (
        <Modal title="Generar factura" onClose={() => setConfirmando(false)}>
          <p className="text-sm text-slate-600">
            Se emitirá la factura por{' '}
            <span className="font-semibold text-slate-900">
              {CURRENCY.format(totalesPrevios(items.data ?? [], tarifaIva.data?.porcentaje ?? 0).total)}
            </span>
            . Después de generarla ya no se podrán agregar ni quitar items de esta orden.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGenerar} disabled={procesando}>
              {procesando ? 'Generando...' : 'Generar factura'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FacturaCard({
  factura,
  loading,
  items,
  porcentajeVigente,
  puedeFacturar,
  procesando,
  onGenerar,
  onPagar,
}: {
  factura: Factura | null
  loading: boolean
  items: ItemOrden[]
  porcentajeVigente: number | null
  puedeFacturar: boolean
  procesando: boolean
  onGenerar: () => void
  onPagar: (facturaId: number) => void
}) {
  if (loading) {
    return (
      <Card>
        <div className="flex flex-col gap-3" aria-label="Cargando">
          <div className="h-5 w-1/2 rounded bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-24 rounded bg-slate-100 motion-safe:animate-pulse" />
        </div>
      </Card>
    )
  }

  const porcentaje = factura ? factura.porcentajeIva : porcentajeVigente
  if (porcentaje == null) {
    return (
      <Card>
        <CardHeader title="Factura" />
        <p className="text-sm text-slate-500">
          No hay una tarifa de IVA vigente. El administrador debe registrarla en Configuración antes de facturar.
        </p>
      </Card>
    )
  }

  const totales = factura
    ? { repuestos: factura.subtotalRepuestos, manoObra: factura.subtotalManoObra, iva: factura.iva, total: factura.total }
    : totalesPrevios(items, porcentaje)

  return (
    <Card>
      {factura ? (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Factura {factura.numero}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Emitida el {factura.fecha}
              {factura.fechaPago && ` · pagada el ${factura.fechaPago}`}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
              factura.estado === 'PAGADA' ? 'bg-accent-100 text-accent-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {factura.estado === 'PAGADA' ? 'Pagada' : 'Pendiente de pago'}
          </span>
        </div>
      ) : (
        <CardHeader title="Factura" subtitle="Vista previa; los precios de los items ya incluyen IVA" />
      )}

      <dl className="flex flex-col gap-2.5 text-sm">
        <Fila label="Repuestos sin IVA" value={totales.repuestos} />
        <Fila label="Mano de obra sin IVA" value={totales.manoObra} />
        <Fila label={`IVA ${porcentaje}%`} value={totales.iva} />
        <div className="mt-1 flex items-baseline justify-between border-t border-slate-200 pt-3">
          <dt className="font-semibold text-slate-900">Total</dt>
          <dd className="text-xl font-semibold text-slate-900 tabular-nums">{CURRENCY.format(totales.total)}</dd>
        </div>
      </dl>

      <div className="mt-5">
        {!puedeFacturar ? (
          <p className="text-sm text-slate-500">Solo administración o caja pueden facturar y registrar pagos.</p>
        ) : factura ? (
          factura.estado === 'PENDIENTE' && (
            <Button type="button" className="w-full" disabled={procesando} onClick={() => onPagar(factura.id)}>
              {procesando ? 'Registrando...' : 'Marcar como pagada'}
            </Button>
          )
        ) : (
          <>
            <Button type="button" className="w-full" disabled={items.length === 0} onClick={onGenerar}>
              Generar factura
            </Button>
            {items.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">Agrega al menos un item para poder facturar.</p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

function Fila({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 tabular-nums">{CURRENCY.format(value)}</dd>
    </div>
  )
}

const TIPOS_FORM: { tipo: TipoItem; label: string }[] = [
  { tipo: 'REPUESTO', label: 'Del inventario' },
  { tipo: 'REPUESTO_EXTERNO', label: 'Comprado afuera' },
  { tipo: 'MANO_DE_OBRA', label: 'Mano de obra' },
]

function AgregarItemCard({ ordenId, onAgregado }: { ordenId: number; onAgregado: () => void }) {
  const inventario = useAsyncData(listarInventario)
  const [tipo, setTipo] = useState<TipoItem>('REPUESTO')
  const [productoId, setProductoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [precio, setPrecio] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [guardando, setGuardando] = useState(false)

  const producto = inventario.data?.find((p) => p.id === Number(productoId))

  function limpiar() {
    setProductoId('')
    setDescripcion('')
    setProveedor('')
    setCantidad('1')
    setPrecio('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let input: ItemOrdenInput
    if (tipo === 'REPUESTO') {
      input = { tipo, producto: { id: Number(productoId) }, cantidad: Number(cantidad) }
    } else if (tipo === 'REPUESTO_EXTERNO') {
      input = {
        tipo,
        descripcion: descripcion.trim(),
        proveedor: proveedor.trim() || null,
        cantidad: Number(cantidad),
        precioUnitario: Number(precio),
      }
    } else {
      input = { tipo, descripcion: descripcion.trim(), precioUnitario: Number(precio) }
    }

    setGuardando(true)
    try {
      await agregarItem(ordenId, input)
      limpiar()
      onAgregado()
      if (tipo === 'REPUESTO') inventario.refetch()
    } catch (err) {
      setError(err as Error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Agregar a la orden" />

      <div role="radiogroup" aria-label="Tipo de item" className="mb-5 grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
        {TIPOS_FORM.map((t) => (
          <button
            key={t.tipo}
            type="button"
            role="radio"
            aria-checked={tipo === t.tipo}
            onClick={() => {
              setTipo(t.tipo)
              setError(null)
            }}
            className={`rounded px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
              tipo === t.tipo ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner error={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tipo === 'REPUESTO' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
            <Field label="Producto">
              <select
                required
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className={INPUT_CLASS}
                disabled={inventario.loading}
              >
                <option value="">{inventario.loading ? 'Cargando inventario...' : 'Selecciona un producto'}</option>
                {inventario.data?.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stockActual <= 0}>
                    {p.nombre} · {CURRENCY.format(p.precioVenta)} · stock {p.stockActual}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cantidad">
              <input
                required
                type="number"
                min={1}
                max={producto?.stockActual}
                step={1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        )}

        {tipo === 'REPUESTO_EXTERNO' && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Repuesto">
                <input
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Bomba de agua Aveo 1.6"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Proveedor (opcional)">
                <input
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Dónde se compró"
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad">
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Precio unitario (con IVA)">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <p className="-mt-1 text-xs text-slate-500">
              No se descuenta del inventario; queda registrado en la orden y en la factura.
            </p>
          </>
        )}

        {tipo === 'MANO_DE_OBRA' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
            <Field label="Trabajo realizado">
              <input
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Cambio de bomba de agua"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Precio (con IVA)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Agregando...' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

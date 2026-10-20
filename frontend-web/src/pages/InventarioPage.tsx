import { useState, type FormEvent } from 'react'
import { useAsyncData } from '../hooks/useAsyncData'
import { crearProducto, listarInventario } from '../services/inventarioService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, INPUT_CLASS } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Th, TableHead, TableLoadingRow, TableStatusRow } from '../components/ui/Table'

const COLUMN_COUNT = 6

export function InventarioPage() {
  const inventario = useAsyncData(listarInventario)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        action={
          <Button type="button" onClick={() => setShowForm(true)}>
            + Nuevo producto
          </Button>
        }
      />

      {inventario.error && <ErrorBanner error={inventario.error} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <TableHead>
            <tr>
              <Th>Producto</Th>
              <Th>SKU</Th>
              <Th>Categoría</Th>
              <Th>Stock actual</Th>
              <Th>Stock mínimo</Th>
              <Th>Precio venta</Th>
            </tr>
          </TableHead>
          <tbody className="divide-y divide-slate-100">
            {inventario.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!inventario.loading && inventario.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay productos registrados</TableStatusRow>
            )}
            {inventario.data?.map((producto) => {
              const bajoStock = producto.stockActual < producto.stockMinimo
              return (
                <tr key={producto.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">{producto.nombre}</td>
                  <td className="px-4 py-4 text-slate-600">{producto.sku}</td>
                  <td className="px-4 py-4 text-slate-600">{producto.categoria ?? '—'}</td>
                  <td className={`px-4 py-4 tabular-nums ${bajoStock ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                    {producto.stockActual}
                    {bajoStock && <span className="ml-1.5 text-xs font-medium">bajo mínimo</span>}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-slate-600">{producto.stockMinimo}</td>
                  <td className="px-4 py-4 tabular-nums text-slate-600">${producto.precioVenta.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {showForm && (
        <NuevoProductoModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            inventario.refetch()
          }}
        />
      )}
    </div>
  )
}

function NuevoProductoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [sku, setSku] = useState('')
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [stockActual, setStockActual] = useState('0')
  const [stockMinimo, setStockMinimo] = useState('0')
  const [precioCompra, setPrecioCompra] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await crearProducto({
        sku,
        nombre,
        categoria: categoria.trim() || null,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
        precioCompra: precioCompra === '' ? null : Number(precioCompra),
        precioVenta: Number(precioVenta),
      })
      onCreated()
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Nuevo producto" onClose={onClose}>
      {error && (
        <div className="mb-4">
          <ErrorBanner error={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre">
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={INPUT_CLASS} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU">
            <input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Categoría">
            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Stock inicial">
            <input
              required
              type="number"
              min={0}
              step={1}
              value={stockActual}
              onChange={(e) => setStockActual(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Stock mínimo">
            <input
              required
              type="number"
              min={0}
              step={1}
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Precio compra">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Opcional"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Precio venta">
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

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

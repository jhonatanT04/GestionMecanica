import { useAsyncData } from '../hooks/useAsyncData'
import { listarInventario } from '../services/inventarioService'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Th, TableLoadingRow, TableStatusRow } from '../components/ui/Table'

const COLUMN_COUNT = 6

export function InventarioPage() {
  const inventario = useAsyncData(listarInventario)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventario" />

      {inventario.error && <ErrorBanner error={inventario.error} />}

      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Producto</Th>
              <Th>SKU</Th>
              <Th>Categoría</Th>
              <Th>Stock actual</Th>
              <Th>Stock mínimo</Th>
              <Th>Precio venta</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventario.loading && <TableLoadingRow colSpan={COLUMN_COUNT} />}
            {!inventario.loading && inventario.data?.length === 0 && (
              <TableStatusRow colSpan={COLUMN_COUNT}>Todavía no hay productos registrados</TableStatusRow>
            )}
            {inventario.data?.map((producto) => {
              const bajoStock = producto.stockActual < producto.stockMinimo
              return (
                <tr key={producto.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{producto.nombre}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{producto.sku}</td>
                  <td className="px-4 py-3 text-slate-600">{producto.categoria ?? '—'}</td>
                  <td className={`px-4 py-3 font-mono font-medium ${bajoStock ? 'text-red-600' : 'text-slate-600'}`}>
                    {producto.stockActual}
                    {bajoStock && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-sans font-semibold tracking-wide text-red-700 uppercase">
                        Bajo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{producto.stockMinimo}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">${producto.precioVenta.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

import { useAsyncData } from '../hooks/useAsyncData'
import { listarInventario } from '../services/inventarioService'
import { ErrorBanner } from '../components/ErrorBanner'

export function InventarioPage() {
  const inventario = useAsyncData(listarInventario)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Inventario</h1>

      {inventario.error && <ErrorBanner error={inventario.error} />}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Producto</Th>
              <Th>SKU</Th>
              <Th>Categoría</Th>
              <Th>Stock actual</Th>
              <Th>Stock mínimo</Th>
              <Th>Precio venta</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventario.loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {inventario.data?.map((producto) => {
              const bajoStock = producto.stockActual < producto.stockMinimo
              return (
                <tr key={producto.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{producto.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{producto.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{producto.categoria ?? '—'}</td>
                  <td className={`px-4 py-3 font-medium ${bajoStock ? 'text-red-600' : 'text-gray-600'}`}>
                    {producto.stockActual}
                    {bajoStock ? ' ⚠' : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{producto.stockMinimo}</td>
                  <td className="px-4 py-3 text-gray-600">${producto.precioVenta.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">{children}</th>
  )
}

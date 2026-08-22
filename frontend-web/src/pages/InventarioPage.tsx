import { useAsyncData } from '../hooks/useAsyncData'
import { listarInventario } from '../services/inventarioService'

export function InventarioPage() {
  const inventario = useAsyncData(listarInventario)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inventario</h1>
        <p className="text-sm text-gray-500">
          Vista de maqueta con datos de ejemplo — se conectará cuando el backend implemente la Fase 2 (repuestos).
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Producto</Th>
              <Th>SKU</Th>
              <Th>Categoría</Th>
              <Th>Disponible</Th>
              <Th>Mínimo</Th>
              <Th>Precio unitario</Th>
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
              const bajoStock = producto.cantidadDisponible < producto.cantidadMinima
              return (
                <tr key={producto.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{producto.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{producto.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{producto.categoria}</td>
                  <td className={`px-4 py-3 font-medium ${bajoStock ? 'text-red-600' : 'text-gray-600'}`}>
                    {producto.cantidadDisponible} {producto.unidad}
                    {bajoStock ? ' ⚠' : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {producto.cantidadMinima} {producto.unidad}
                  </td>
                  <td className="px-4 py-3 text-gray-600">${producto.precioUnitario.toFixed(2)}</td>
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

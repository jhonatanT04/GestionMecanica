import type { Producto } from '../types'
import { inventarioMock } from '../mocks/inventario'

// TODO(backend Fase 2): reemplazar por apiClient.get<Producto[]>('/productos')
export async function listarInventario(): Promise<Producto[]> {
  return inventarioMock
}

import type { Producto, ProductoInput } from '../types'
import { apiClient } from '../api/client'

export function listarInventario(): Promise<Producto[]> {
  return apiClient.get<Producto[]>('/productos')
}

export function crearProducto(input: ProductoInput): Promise<Producto> {
  return apiClient.post<Producto>('/productos', input)
}

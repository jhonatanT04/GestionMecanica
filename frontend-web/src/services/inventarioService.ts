import type { Producto } from '../types'
import { apiClient } from '../api/client'

export function listarInventario(): Promise<Producto[]> {
  return apiClient.get<Producto[]>('/productos')
}

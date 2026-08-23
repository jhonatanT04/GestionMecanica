import type { OrdenDeTrabajo } from '../types'
import { apiClient } from '../api/client'

export function listarOrdenes(): Promise<OrdenDeTrabajo[]> {
  return apiClient.get<OrdenDeTrabajo[]>('/ordenes')
}

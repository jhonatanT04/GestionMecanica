import type { OrdenDeTrabajo, OrdenDeTrabajoInput } from '../types'
import { apiClient } from '../api/client'

export function listarOrdenes(): Promise<OrdenDeTrabajo[]> {
  return apiClient.get<OrdenDeTrabajo[]>('/ordenes')
}

export function obtenerOrden(id: number): Promise<OrdenDeTrabajo> {
  return apiClient.get<OrdenDeTrabajo>(`/ordenes/${id}`)
}

export function crearOrden(input: OrdenDeTrabajoInput): Promise<OrdenDeTrabajo> {
  return apiClient.post<OrdenDeTrabajo>('/ordenes', input)
}

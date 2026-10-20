import type { Factura, ItemOrden, ItemOrdenInput } from '../types'
import { ApiError, apiClient } from '../api/client'

export function listarFacturas(): Promise<Factura[]> {
  return apiClient.get<Factura[]>('/facturas')
}

export function listarItems(ordenId: number): Promise<ItemOrden[]> {
  return apiClient.get<ItemOrden[]>(`/ordenes/${ordenId}/items`)
}

export function agregarItem(ordenId: number, item: ItemOrdenInput): Promise<ItemOrden> {
  return apiClient.post<ItemOrden>(`/ordenes/${ordenId}/items`, item)
}

export function eliminarItem(ordenId: number, itemId: number): Promise<void> {
  return apiClient.delete<void>(`/ordenes/${ordenId}/items/${itemId}`)
}

export async function obtenerFacturaDeOrden(ordenId: number): Promise<Factura | null> {
  try {
    return await apiClient.get<Factura>(`/ordenes/${ordenId}/factura`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export function generarFactura(ordenId: number): Promise<Factura> {
  return apiClient.post<Factura>(`/ordenes/${ordenId}/factura`, {})
}

export function marcarFacturaPagada(facturaId: number): Promise<Factura> {
  return apiClient.patch<Factura>(`/facturas/${facturaId}/pagar`)
}

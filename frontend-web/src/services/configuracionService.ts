import type { TarifaIva, TarifaIvaInput } from '../types'
import { apiClient } from '../api/client'

export function obtenerIvaVigente(): Promise<TarifaIva> {
  return apiClient.get<TarifaIva>('/configuracion/iva')
}

export function listarTarifasIva(): Promise<TarifaIva[]> {
  return apiClient.get<TarifaIva[]>('/configuracion/iva/historial')
}

export function registrarTarifaIva(input: TarifaIvaInput): Promise<TarifaIva> {
  return apiClient.post<TarifaIva>('/configuracion/iva', input)
}

export function eliminarTarifaIva(id: number): Promise<void> {
  return apiClient.delete<void>(`/configuracion/iva/${id}`)
}

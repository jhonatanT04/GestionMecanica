import type { Vehiculo } from '../types'
import { apiClient } from '../api/client'

export function listarVehiculos(): Promise<Vehiculo[]> {
  return apiClient.get<Vehiculo[]>('/vehiculos')
}

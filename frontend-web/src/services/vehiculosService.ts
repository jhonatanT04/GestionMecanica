import type { Vehiculo } from '../types'
import { vehiculosMock } from '../mocks/vehiculos'

// TODO(backend Fase 1): reemplazar por apiClient.get<Vehiculo[]>('/vehiculos')
export async function listarVehiculos(): Promise<Vehiculo[]> {
  return vehiculosMock
}

import type { Cliente } from './cliente'

export interface Vehiculo {
  id: number
  placa: string
  marca: string | null
  modelo: string | null
  anio: number | null
  kilometrajeActual: number | null
  cliente: Cliente
}

export interface VehiculoInput {
  placa: string
  marca?: string | null
  modelo?: string | null
  anio?: number | null
  kilometrajeActual?: number | null
  cliente: { id: number }
}

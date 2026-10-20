import type { Cliente } from './cliente'
import type { Marca } from './marca'

export interface Vehiculo {
  id: number
  placa: string
  marca: Marca | null
  modelo: string | null
  anio: number | null
  kilometrajeActual: number | null
  cliente: Cliente
}

export interface VehiculoInput {
  placa: string
  marca?: { id: number } | null
  modelo?: string | null
  anio?: number | null
  kilometrajeActual?: number | null
  cliente: { id: number }
}

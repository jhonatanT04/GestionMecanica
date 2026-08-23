import type { Vehiculo } from './vehiculo'
import type { Usuario } from './usuario'

export const ESTADOS_ORDEN = [
  'RECIBIDO',
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'LISTO',
  'ENTREGADO',
] as const

export type EstadoOrden = (typeof ESTADOS_ORDEN)[number]

export interface OrdenDeTrabajo {
  id: number
  fechaEntrada: string
  fechaEstimadaSalida: string | null
  fechaRealSalida: string | null
  kilometrajeIngreso: number | null
  problemaReportado: string | null
  diagnostico: string | null
  estado: EstadoOrden
  vehiculo: Vehiculo
  mecanicoAsignado: Usuario | null
}

export interface OrdenDeTrabajoInput {
  fechaEntrada: string
  fechaEstimadaSalida?: string | null
  kilometrajeIngreso?: number | null
  problemaReportado?: string | null
  diagnostico?: string | null
  estado: EstadoOrden
  vehiculo: { id: number }
  mecanicoAsignado?: { id: number } | null
}

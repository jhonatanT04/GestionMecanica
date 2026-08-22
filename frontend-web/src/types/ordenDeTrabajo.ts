export const ESTADOS_ORDEN = [
  'RECIBIDO',
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'LISTO',
  'ENTREGADO',
] as const

export type EstadoOrden = (typeof ESTADOS_ORDEN)[number]

export interface OrdenDeTrabajo {
  id: string
  fechaEntrada: string
  fechaEstimadaSalida: string | null
  fechaRealSalida: string | null
  kilometrajeIngreso: number
  problemaReportado: string
  diagnostico: string | null
  estado: EstadoOrden
  vehiculoId: string
  mecanicoId: string | null
}

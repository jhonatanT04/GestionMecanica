import type { EstadoOrden, RolUsuario } from '../types'

export const ROL_LABELS: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  MECANICO: 'Mecánico',
  CAJA: 'Caja',
}

export const MES_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const ESTADO_LABELS: Record<EstadoOrden, string> = {
  RECIBIDO: 'Recibido',
  EN_DIAGNOSTICO: 'En diagnóstico',
  EN_REPARACION: 'En reparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
}

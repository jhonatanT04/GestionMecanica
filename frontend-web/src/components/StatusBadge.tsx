import type { EstadoOrden } from '../types'

/*
 * Sin color por estado: la jerarquía viene del peso/tono de gris, no de
 * una paleta semántica. RECIBIDO/EN_DIAGNOSTICO en curso normal,
 * EN_REPARACION/LISTO en énfasis (trabajo activo o listo para entregar),
 * ENTREGADO atenuado (archivado).
 */
const ESTADO_STYLES: Record<EstadoOrden, string> = {
  RECIBIDO: 'text-slate-500',
  EN_DIAGNOSTICO: 'text-slate-500',
  EN_REPARACION: 'text-slate-900 font-semibold',
  LISTO: 'text-slate-900 font-semibold',
  ENTREGADO: 'text-slate-400',
}

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  RECIBIDO: 'Recibido',
  EN_DIAGNOSTICO: 'En diagnóstico',
  EN_REPARACION: 'En reparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
}

export function StatusBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <span className={`text-xs tracking-wide whitespace-nowrap uppercase ${ESTADO_STYLES[estado]}`}>
      {ESTADO_LABELS[estado]}
    </span>
  )
}

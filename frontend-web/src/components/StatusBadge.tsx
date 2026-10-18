import type { EstadoOrden } from '../types'
import { ESTADO_LABELS } from '../lib/labels'

/*
 * Pastilla neutra; el énfasis se reserva para lo que pide acción:
 * EN_REPARACION (trabajo activo) en tinta fuerte y LISTO (listo para
 * entregar) con el acento. ENTREGADO queda atenuado (archivado).
 */
const ESTADO_STYLES: Record<EstadoOrden, string> = {
  RECIBIDO: 'bg-slate-100 text-slate-600',
  EN_DIAGNOSTICO: 'bg-slate-100 text-slate-600',
  EN_REPARACION: 'bg-slate-100 text-slate-900 font-semibold',
  LISTO: 'bg-accent-100 text-accent-700 font-semibold',
  ENTREGADO: 'bg-transparent text-slate-400',
}


export function StatusBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${ESTADO_STYLES[estado]}`}>
      {ESTADO_LABELS[estado]}
    </span>
  )
}

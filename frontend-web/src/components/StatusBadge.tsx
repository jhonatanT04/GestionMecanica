import type { EstadoOrden } from '../types'

const ESTADO_STYLES: Record<EstadoOrden, string> = {
  RECIBIDO: 'bg-slate-100 text-slate-700',
  EN_DIAGNOSTICO: 'bg-amber-100 text-amber-700',
  EN_REPARACION: 'bg-blue-100 text-blue-700',
  LISTO: 'bg-emerald-100 text-emerald-700',
  ENTREGADO: 'bg-gray-200 text-gray-500',
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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${ESTADO_STYLES[estado]}`}
    >
      {ESTADO_LABELS[estado]}
    </span>
  )
}

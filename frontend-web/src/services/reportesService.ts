import type { ReporteFacturacionMecanico, ReporteFacturacionMensual, ReporteFiltro } from '../types'
import { apiClient } from '../api/client'

function buildQuery(filtro: ReporteFiltro): string {
  const params = new URLSearchParams()
  if (filtro.desde) params.set('desde', filtro.desde)
  if (filtro.hasta) params.set('hasta', filtro.hasta)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function obtenerReportePorMes(filtro: ReporteFiltro = {}): Promise<ReporteFacturacionMensual[]> {
  return apiClient.get<ReporteFacturacionMensual[]>(`/reportes/facturacion/por-mes${buildQuery(filtro)}`)
}

export function obtenerReportePorMecanico(filtro: ReporteFiltro = {}): Promise<ReporteFacturacionMecanico[]> {
  return apiClient.get<ReporteFacturacionMecanico[]>(`/reportes/facturacion/por-mecanico${buildQuery(filtro)}`)
}

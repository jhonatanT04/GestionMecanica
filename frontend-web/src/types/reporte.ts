export interface ReporteFacturacionMensual {
  anio: number
  mes: number
  totalFacturado: number
  cantidadFacturas: number
}

export interface ReporteFacturacionMecanico {
  mecanicoId: number | null
  mecanicoNombre: string
  totalFacturado: number
  cantidadFacturas: number
}

export interface ReporteFiltro {
  desde?: string
  hasta?: string
}
